<#ftl output_format="plainText">
FreelanceHub Verification Code
------------------------------------

Hello <#if user.firstName??>${user.firstName}<#else>there</#if>,

Use the following One-Time Password (OTP) to complete your verification on FreelanceHub:

VERIFICATION CODE: <#if user.attributes?? && user.attributes.login_otp??><#if user.attributes.login_otp?is_enumerable>${user.attributes.login_otp[0]}<#else>${user.attributes.login_otp}</#if><#elseif code??>${code}<#else>------</#if>

This verification code expires in 10 minutes. Do not share this code with anyone.

<#if link??>
Alternatively, you can verify your email directly by opening this link:
${link}
</#if>

If you did not request this verification code, please ignore this email.

--
FreelanceHub Identity Service (Keycloak SMTP)
