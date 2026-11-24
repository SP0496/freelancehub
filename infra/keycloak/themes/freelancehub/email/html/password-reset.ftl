<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreelanceHub Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #2563eb; width: 40px; height: 40px; border-radius: 8px; text-align: center; vertical-align: middle; font-weight: 800; color: #ffffff; font-size: 18px; font-family: sans-serif;">
                    FH
                  </td>
                  <td style="padding-left: 12px; font-size: 20px; font-weight: 700; color: #ffffff; font-family: sans-serif;">
                    FreelanceHub
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">
                Reset Your Password
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                Hello <#if user.firstName??><strong>${user.firstName}</strong><#else>there</#if>, someone requested a password reset for your FreelanceHub account.
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 700;">
                  Set New Password
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center;">
                This link will expire in 30 minutes. If you did not request this change, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                FreelanceHub Identity Service &bull; Authenticated via Keycloak SMTP
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
