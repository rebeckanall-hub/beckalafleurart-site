# beckalafleurart.com

Static copy of the WordPress/WooCommerce art site, hosted on Cloudflare Pages.
There is no cart: available paintings link to an inquiry form or to the gallery.

- No build step: Cloudflare Pages serves this folder as-is (build command empty, output directory `/`).
- `assets/forms.js` sends the inquiry, commission and newsletter forms through Web3Forms.
- `/inquire/?piece=Name` pre-fills the painting; its listed price is attached to the email
  (from the `rn-prices` data on that page) but not shown to visitors.
- Paintings at Asbury Park Art Club link to their listing on the gallery's site.
