## 持久号（长期号码）功能实现方案

### 一、数据库变更

**新增表 `persistent_numbers`（持久号订阅记录）**
- `user_id` — 持有者
- `phone_number` / `country_code` — 号码信息
- `first_service_id` — 首次使用的服务（决定月租）
- `monthly_fee` — 月租金额（= 首次服务价格）
- `status` — `active` / `grace_period` / `expired`
- `current_period_start` / `current_period_end` — 当前计费周期
- `used_this_period` — 本周期内是否使用过（决定下月是否免费）
- `grace_period_end` — 宽限期截止时间（仅在余额不足时设置）
- `last_renewed_at` / `next_billing_at`

**修改 `phone_numbers` 表**
- 增加 `owner_user_id`（持久持有者），若非空则不进入公共池
- 增加 `is_persistent` 标记

**修改 `orders` 表**
- 增加 `is_persistent_use` 标记（标识本订单是持久号产生的接码）

**新增 `transactions.type` 值**：`persistent_subscribe`（首次锁定）、`persistent_renewal`（续费扣款）

**RLS**：用户只能查看/管理自己的持久号；管理员可全部查看。

### 二、核心逻辑

**1. 锁定为持久号**
- 入口 A：`ReceiveCodePage` 接收到验证码后显示「锁定为长期号码」按钮
- 入口 B：购买时勾选「长期持有」（在国家/服务选择页加 checkbox）
- 创建 `persistent_numbers` 记录，`monthly_fee = 当前服务价格`，`current_period_end = now + 30 天`
- `phone_numbers.owner_user_id = 用户`，从公共池移除

**2. 持久号接码（跨服务定价）**
- 用户中心新增「我的长期号码」列表，每个号码可选择服务来接码
- 创建 order 时按所选服务的**当前实时价格**扣费
- 接码成功后 `used_this_period = true`

**3. 月度续费（edge function + pg_cron 每日执行）**
- 新建 edge function `renew-persistent-numbers`
- 每日扫描 `next_billing_at <= now` 的 active 记录：
  - 若 `used_this_period = true` → 免费续期，重置周期，`used_this_period = false`
  - 若 `used_this_period = false` → 扣 `monthly_fee`：
    - 余额够 → 扣款 + 重置周期 + 写 transaction
    - 余额不够 → 进入 `grace_period`，`grace_period_end = now + 7 天`，暂停接码
- 每日扫描 `grace_period_end <= now` 的 grace 记录 → 释放号码回公共池，状态置 `expired`，清除 `phone_numbers.owner_user_id`

**4. 宽限期手动续费**
- 用户中心持久号列表显示「续费」按钮（仅 grace 状态可见），点击扣月租回到 active

**5. pg_cron**
- 每天 02:00 调用 edge function

### 三、前端变更

- `src/pages/ReceiveCodePage.tsx`：成功接码后展示「锁定为长期号码 ($X/月)」按钮
- `src/pages/Index.tsx` 或选号流程：增加「长期持有」勾选项
- `src/pages/UserCenterPage.tsx`：新增「我的长期号码」标签页
  - 列表展示：号码、月租、下次扣费日、状态徽章、本月是否已使用
  - 操作：选服务接码 / 续费（grace）/ 取消订阅
- `src/pages/admin/`：新增 `AdminPersistentNumbers.tsx` 管理后台

### 四、技术细节

```text
status 流转：
  active --(余额不足扣月租)--> grace_period --(7天未续)--> expired (释放号码)
  active --(用户取消)--> expired (释放号码)
  grace_period --(用户手动续费)--> active
```

- 扣款使用 RPC 函数 `charge_persistent_renewal(persistent_id)`（security definer），保证扣余额 + 写 transaction + 更新状态原子化
- 月租字段 `monthly_fee` 在创建时锁定，永不变化（即使首次服务价格后续被管理员调整）
- 跨服务接码价格 = 实时从 `country_services` 读取，不缓存
