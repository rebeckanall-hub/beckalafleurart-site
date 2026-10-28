// Sends the site's forms (inquiries, commissions, newsletter) through Web3Forms
// (https://web3forms.com) instead of WordPress. Each submission arrives as an email.
const WEB3FORMS_ACCESS_KEY = 'ca81e074-9d24-46ba-b764-27d437ee3343';

// Inquire page: fill in the painting from ?piece= and attach its private listed price.
const pieceField = document.querySelector('[name="form_fields[piece]"]');
if (pieceField) {
  const piece = new URLSearchParams(location.search).get('piece');
  if (piece) pieceField.value = piece;
  let prices = {};
  try { prices = JSON.parse(document.getElementById('rn-prices').textContent); } catch (e) {}
  const priceField = document.querySelector('[name="form_fields[listed_price]"]');
  const syncPrice = () => { priceField.value = prices[pieceField.value.trim()] || ''; };
  pieceField.addEventListener('input', syncPrice);
  syncPrice();
}

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('form.elementor-form');
  if (!form) return;

  // Stop Elementor's own handler, which would post to WordPress.
  event.preventDefault();
  event.stopImmediatePropagation();

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    from_name: 'beckalafleurart.com',
    botcheck: form.querySelector('[name="botcheck"]')?.checked || false,
  };
  let firstName = '';
  for (const field of form.querySelectorAll('[name^="form_fields["]')) {
    const value = field.value.trim();
    if (field.type === 'email') {
      payload.email = value;
      continue;
    }
    const label = field.dataset.label
      || form.querySelector(`label[for="${field.id}"]`)?.textContent.trim()
      || field.placeholder || field.name;
    payload[label] = value;
    if (!firstName && /name/i.test(label)) firstName = value;
  }
  const piece = form.querySelector('[name="form_fields[piece]"]')?.value.trim();
  payload.subject = `beckalafleurart.com: ${form.dataset.rnSubject || 'Website message'}`
    + (piece ? ` – ${piece}` : '') + (firstName ? ` from ${firstName}` : '');

  const button = form.querySelector('button[type="submit"]');
  const buttonText = form.querySelector('.elementor-button-text') || button;
  form.querySelector('.rn-form-message')?.remove();
  const message = document.createElement('div');
  message.className = 'rn-form-message elementor-message';
  message.setAttribute('role', 'alert');

  button.disabled = true;
  const originalText = buttonText.textContent;
  buttonText.textContent = 'Sending…';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    form.reset();
    if (pieceField && form.contains(pieceField)) pieceField.value = piece;
    message.classList.add('elementor-message-success');
    message.textContent = form.dataset.rnSuccess
      || (form.dataset.rnSubject === 'Newsletter signup' ? "Thanks for joining the list!" : "Thanks! I'll be in touch soon.");
  } catch (error) {
    message.classList.add('elementor-message-danger');
    message.textContent = `Sorry, something went wrong. Please try again or email art.beckalafleur@gmail.com.`;
  } finally {
    button.disabled = false;
    buttonText.textContent = originalText;
    form.appendChild(message);
  }
}, true);

// Hidden honeypot checkbox: bots tick it, people never see it.
document.querySelectorAll('form.elementor-form').forEach((form) => {
  const trap = document.createElement('input');
  Object.assign(trap, { type: 'checkbox', name: 'botcheck', tabIndex: -1 });
  trap.style.display = 'none';
  form.appendChild(trap);
});
