class BalanceWidget extends HTMLElement {
  connectedCallback() {
    const api = window['__api_sample-balance-widget'];
    const user = api?.auth?.getCurrentUser?.() ?? { fullName: 'Guest' };

    this.innerHTML = `
      <div style="border:1px solid #003087;border-radius:8px;padding:16px;font-family:Inter,sans-serif">
        <h3 style="color:#003087;margin:0 0 8px">Account Balance</h3>
        <p style="margin:0;font-size:14px;color:#666">Welcome, ${user.fullName}</p>
        <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#003087">$12,450.00</p>
        <p style="margin:4px 0 0;font-size:12px;color:#999">Savings Account · **** 4521</p>
      </div>
    `;
  }
}
customElements.define('internal-balance-widget', BalanceWidget);
