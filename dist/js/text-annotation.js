// CritIQ - Text annotation dialog

function requestAnnotationText() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'text-input-overlay';
    overlay.innerHTML = `
      <div class="text-input-dialog">
        <input type="text" id="text-input" placeholder="Enter annotation text..." autofocus>
        <div class="dialog-buttons">
          <button id="text-cancel" class="btn btn-secondary">Cancel</button>
          <button id="text-ok" class="btn btn-primary">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#text-input');
    const finish = (value) => {
      overlay.remove();
      resolve(value);
    };
    const accept = () => finish(input.value.trim());

    overlay.querySelector('#text-ok').addEventListener('click', accept);
    overlay.querySelector('#text-cancel').addEventListener('click', () => finish(''));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') accept();
      if (event.key === 'Escape') finish('');
    });
    input.focus();
  });
}

export { requestAnnotationText };
