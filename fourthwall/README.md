# Fourthwall CSS reference

`custom.css` is a versioned handoff file for the existing shop at https://shop.kyuukei.com. It is stored in GitHub for access and future manual copying. The `fourthwall` directory is excluded from Jekyll, the main website does not import it, and no change is applied to the shop automatically.

## Recommended approach

Keep Fourthwall's hosted storefront. Use its native theme settings for colors and fonts where those settings are available, and maintain a small CSS adapter for the styling they do not cover. This preserves Fourthwall's product, cart and checkout behavior while carrying the Kyuukei palette and typography across the two sites.

Keep plain CSS in this file, then copy it into the current theme's supported CSS customization area after previewing it. GitHub is the editing/reference source, not a CSS CDN. Do not link the shop to the main website stylesheet or a raw GitHub URL.

The main-site CSS includes its own page layout, component classes, local asset paths and cursor behavior. Importing it wholesale would not establish the correct selectors for Fourthwall. A Storefront API/headless rebuild is unnecessary for a shop-styling task.

## Current file status

The file contains the approved Ribbon Rose palette, Orby-pink action color and font-family references. All custom properties use the `--kyuukei-` prefix. No unverified Fourthwall variable names, generated class names or DOM selectors have been invented. The variables alone do not reskin the shop.

Theme-specific rules are the next stage, after the actual theme and its CSS hooks have been inspected. Confirm how the editor accepts custom CSS and how it loads fonts; the family names in this file do not load webfonts. Preview the listing, product page, variant controls and cart at desktop/mobile widths before manually applying the completed stylesheet. Hosted checkout customization must be verified separately.

## Research and evidence

The current environment returned HTTP CONNECT 403 for the public documentation and shop:

- https://docs.fourthwall.com/
- https://help.fourthwall.com/
- https://shop.kyuukei.com/

Public Fourthwall GitHub sources were accessible:

- [Fourthwall, Inc. organization](https://github.com/FourthwallHQ) links to the official Fourthwall documentation.
- [Official Storefront API example](https://github.com/FourthwallHQ/fourthwall-examples/blob/ea319a0652141a2c2004bb680752fc8bbe0aa66a/examples/storefront-api/README.md) documents API-driven shop embeds and checkout redirection. This is a separate integration approach, not a requirement for CSS customization.
- [Fourthwall's theme-liquid-docs repository](https://github.com/FourthwallHQ/theme-liquid-docs/blob/ed07da9/README.md) is a fork of Shopify's Liquid/schema reference. It does not, by itself, verify the current hosted shop's editor controls or CSS selectors. It is not evidence that Shopify theme variables can be pasted into this shop.

These sources support keeping an API rebuild out of this styling task. The exact editor workflow, active theme, supported selector hooks and font settings remain unverified because direct documentation/shop access is blocked. The CSS is therefore a foundation for review, not a claim that a full Fourthwall skin has been tested or applied.
