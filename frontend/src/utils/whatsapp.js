// Builds a formatted order message from cart items and opens WhatsApp
// with the chat pre-filled, ready to send.

export const buildWhatsAppMessage = (items, totalPrice, customer = {}) => {
  const lines = [];
  lines.push('Hi XyvorA! I would like to place an order:');
  lines.push('');

  items.forEach((item, idx) => {
    const variant = [item.size, item.color].filter(Boolean).join(' / ');
    lines.push(
      `${idx + 1}. ${item.name}${variant ? ` (${variant})` : ''} x${item.quantity} — ₹${(
        item.price * item.quantity
      ).toLocaleString('en-IN')}`
    );
  });

  lines.push('');
  lines.push(`Total: ₹${totalPrice.toLocaleString('en-IN')}`);

  if (customer.name) lines.push(`Name: ${customer.name}`);
  if (customer.phone) lines.push(`Phone: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  if (customer.address) lines.push(`Delivery Address: ${customer.address}`);

  lines.push('');
  lines.push('Please confirm availability and delivery details. Thank you!');

  return lines.join('\n');
};

export const openWhatsAppCheckout = (whatsappNumber, items, totalPrice, customer = {}) => {
  if (!whatsappNumber) {
    alert('Store WhatsApp number is not configured yet. Please contact the store admin.');
    return;
  }
  const message = buildWhatsAppMessage(items, totalPrice, customer);
  const cleanedNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
