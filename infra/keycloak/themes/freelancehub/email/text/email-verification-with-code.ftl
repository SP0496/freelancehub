<#ftl output_format="plainText">
FreelanceHub Verification Code
------------------------------------

Hello <#if user?? && user.firstName??>${user.firstName}<#else>there</#if>,

Use the following verification code to complete your registration on FreelanceHub:

VERIFICATION CODE: <#if code??>${code}<#elseif user?? && user.attributes?? && user.attributes.login_otp??><#if user.attributes.login_otp?is_enumerable>${user.attributes.login_otp[0]}<#else>${user.attributes.login_otp}</#if><#else>------</#if>

This code is valid for 10 minutes. Do not share this code with anyone.

If you did not request this verification code, please ignore this email.

--
FreelanceHub Identity Service (Keycloak SMTP)
