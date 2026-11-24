<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreelanceHub Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
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

          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">
                Verification Code
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                Hello <#if user.firstName??><strong>${user.firstName}</strong><#else>there</#if>, please use the verification code below to complete your sign-in to FreelanceHub.
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 16px 36px; text-align: center;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; display: block;">
                        <#if user.attributes?? && user.attributes.login_otp??><#if user.attributes.login_otp?is_enumerable>${user.attributes.login_otp[0]}<#else>${user.attributes.login_otp}</#if><#elseif code??>${code}<#else>------</#if>
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                This single-use code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
              </p>

              <#if link??>
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">
                  Or click the button below to verify directly:
                </p>
                <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                  Verify Email Address
                </a>
              </div>
              </#if>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px;">
                If you did not request this code, you can safely ignore this email. Someone may have entered your username by mistake.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;">
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
