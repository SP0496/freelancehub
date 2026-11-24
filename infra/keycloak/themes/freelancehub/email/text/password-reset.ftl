<#ftl output_format="plainText">
FreelanceHub Password Reset
------------------------------------

Hello <#if user.firstName??>${user.firstName}<#else>there</#if>,

Someone requested a password reset for your FreelanceHub account. Click the link below to set a new password:

${link}

This link will expire in 30 minutes.

If you did not request this change, you can safely ignore this email.

--
FreelanceHub Identity Service (Keycloak SMTP)
