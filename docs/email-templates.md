# Email Templates

This document describes the process for creating and managing email templates in the Lifeing application.

## Overview

Our email templates are built using [MJML](https://mjml.io/) to ensure consistent, responsive design across all email clients. Currently, we use email templates for authentication flows via Supabase Auth, but the system is designed to support other email types in the future.

## Template Structure

Each email template consists of three files:

- **Plain HTML file**: The original/existing template (e.g., `reset-password.html`)
- **MJML file**: The MJML source template (e.g., `reset-password-mjml.html`)
- **Final HTML file**: The compiled HTML from MJML (replaces the plain file when ready)

## Workflow

### 1. Base Template

All email templates should build upon `_template-mjml.html`, which provides:

- Consistent Figma design implementation
- Lifeing branding (logo, colors, typography)
- Standard structure with placeholders:
  - `HEADING_GOES_HERE` - Email title
  - `MESSAGE_GOES_HERE` - Main message content
  - `<!-- CONTENT_GOES_HERE -->` - Custom content section
- Pre-configured footer and support contact

### 2. Creating New Templates

1. **Copy the base template**:

   ```bash
   cp supabase/setup/email/_template-mjml.html supabase/setup/email/your-template-mjml.html
   ```

2. **Customize the content**:

   - Replace `HEADING_GOES_HERE` with your email title
   - Replace `MESSAGE_GOES_HERE` with your main message
   - Add custom content in the `<!-- CONTENT_GOES_HERE -->` section

3. **Preview and convert using MJML Live Editor**:

   - Open [MJML Try It Live](https://mjml.io/try-it-live/DxTQVbM0Bv)
   - Paste your MJML code
   - Preview the design in different viewports
   - Copy the generated HTML code

4. **Save the final HTML**:
   - Create or update the corresponding `.html` file
   - Paste the compiled HTML from the MJML editor

### 3. Content Examples

#### Button-Based Emails (Reset Password, Confirmations)

```mjml
<!-- Replace CONTENT_GOES_HERE with: -->
<mj-section background-color="transparent" padding="0">
  <mj-column>
    <mj-button
      background-color="#42104C"
      color="#FAFAFA"
      font-size="14px"
      font-weight="500"
      border-radius="6px"
      width="219px"
      height="36px"
      padding="8px 16px"
      href="{{ .SiteURL }}/your-action-url"
    >
      Button Text
    </mj-button>
  </mj-column>
</mj-section>
```

#### Code Display Emails (Signup Confirmation)

```mjml
<!-- Replace CONTENT_GOES_HERE with: -->
<mj-section background-color="transparent" padding="0">
  <mj-column>
    <mj-text
      font-family="Inter, Arial, sans-serif"
      font-size="50px"
      font-weight="600"
      line-height="60px"
      color="#09090B"
      align="left"
      padding="0 0 32px 0"
      letter-spacing="4px"
    >
      {{ .Token }}
    </mj-text>
  </mj-column>
</mj-section>
```

## Supabase Auth Integration

### Current Usage

We currently use email templates for Supabase authentication flows:

- **Confirm Signup**: Email verification during user registration
- **Reset Password**: Password reset functionality

### Managing Templates

Follow the [Supabase Auth Email Templates guide](https://supabase.com/docs/guides/auth/auth-email-templates) to configure templates in your Supabase project. To manage via the dashboard:

- Go to Authentication → Email Templates in your Supabase dashboard
- Paste the compiled HTML into the template editor

### Redirect URL Configuration

**Important**: When using dynamic URLs (like Vercel preview URLs) in email templates with `{{ .RedirectTo }}`, you must configure the redirect URLs in your Supabase project settings.

#### Required Configuration

1. Go to your Supabase dashboard → Authentication → URL Configuration
2. Add the following redirect URLs to the allow list:

**For Development:**

- `http://localhost:3000/**`

**For Vercel Preview Deployments:**

- `https://*-lifeing.vercel.app/**`

**For Staging:**

- `https://staging.lifeing.services/**`

**For Production:**

- `https://lifeing.services/**`

#### Why This Is Needed

When using `{{ .RedirectTo }}` in email templates, Supabase validates that the redirect URL is in the allow list before sending the email. Without this configuration, users will be redirected to localhost or the default Site URL instead of the dynamic Vercel URL.

For more details, see the [Supabase Redirect URLs documentation](https://supabase.com/docs/guides/auth/redirect-urls).

### Available Variables

Supabase provides these template variables for dynamic content:

| Variable                 | Description                       |
| ------------------------ | --------------------------------- |
| `{{ .ConfirmationURL }}` | Complete confirmation URL         |
| `{{ .Token }}`           | 6-digit OTP code                  |
| `{{ .TokenHash }}`       | Hashed version of the token       |
| `{{ .SiteURL }}`         | Your application's site URL       |
| `{{ .RedirectTo }}`      | Redirect URL after action         |
| `{{ .Data }}`            | User metadata                     |
| `{{ .Email }}`           | User's email address              |
| `{{ .NewEmail }}`        | New email (for change email flow) |

## Design Standards

### Colors

- Background: `#F6F0ED` (light beige)
- Card background: `#FFFFFF` (white)
- Primary text: `#09090B` (near black)
- Button background: `#42104C` (dark purple)
- Button text: `#FAFAFA` (off-white)
- Footer text: `#71717A` (gray)
- Support links: `#42104C` (dark purple)

### Typography

- **Headings**: Inter, 600 weight, 24px
- **Body text**: Schibsted Grotesk, 400 weight, 14px
- **Button text**: Schibsted Grotesk, 500 weight, 14px
- **Footer**: Schibsted Grotesk, 400 weight, 12px

### Layout

- Card border radius: 15px
- Card padding: 32px
- Section gaps: 24px, 40px for larger separations
- Button dimensions: 219px width, 36px height

## Future Expansion

While currently focused on authentication emails, this template system can scale for all other email types, including but not limited to:

- Marketing emails
- Transactional notifications
- Newsletter campaigns
- System announcements
- User engagement emails

When implementing these, follow the same MJML → HTML workflow described above.

## Best Practices

1. **Always test in MJML Live Editor** before deploying
2. **Preview across different screen sizes** (desktop, tablet, mobile)
3. **Test in multiple email clients** when possible
4. **Keep accessibility in mind** (alt text, good contrast ratios)
5. **Use semantic HTML** in custom content sections
6. **Maintain consistent spacing** with the design system
7. **Include fallback fonts** for better compatibility

## File Locations

- Base template: `supabase/setup/email/_template-mjml.html`
- MJML templates: `supabase/setup/email/*-mjml.html`
- Final HTML templates: `supabase/setup/email/*.html`
