// Style constants
export const HOVER_BORDER_COLOR = '#383838';
export const SELECTED_BORDER_COLOR = '#5156E9';
export const CLEAR_BUTTON_SIZE = 32;
export const CLEAR_BUTTON_OFFSET = 32;
export const INSPECTOR_CLEAR_BUTTON_ATTR = 'data-inspector-clear-button';
const closeIconSvg = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.4608 13.6644C14.513 13.7166 14.5545 13.7787 14.5828 13.8469C14.6111 13.9152 14.6256 13.9884 14.6256 14.0623C14.6256 14.1362 14.6111 14.2094 14.5828 14.2777C14.5545 14.346 14.513 14.408 14.4608 14.4603C14.4085 14.5126 14.3465 14.554 14.2782 14.5823C14.2099 14.6106 14.1367 14.6251 14.0628 14.6251C13.9889 14.6251 13.9157 14.6106 13.8474 14.5823C13.7791 14.554 13.7171 14.5126 13.6648 14.4603L9.00031 9.79506L4.33578 14.4603C4.23023 14.5658 4.08708 14.6251 3.93781 14.6251C3.78855 14.6251 3.64539 14.5658 3.53984 14.4603C3.4343 14.3547 3.375 14.2116 3.375 14.0623C3.375 13.9131 3.4343 13.7699 3.53984 13.6644L8.20508 8.99982L3.53984 4.33529C3.4343 4.22975 3.375 4.08659 3.375 3.93732C3.375 3.78806 3.4343 3.6449 3.53984 3.53936C3.64539 3.43381 3.78855 3.37451 3.93781 3.37451C4.08708 3.37451 4.23023 3.43381 4.33578 3.53936L9.00031 8.20459L13.6648 3.53936C13.7704 3.43381 13.9135 3.37451 14.0628 3.37451C14.2121 3.37451 14.3552 3.43381 14.4608 3.53936C14.5663 3.6449 14.6256 3.78806 14.6256 3.93732C14.6256 4.08659 14.5663 4.22975 14.4608 4.33529L9.79555 8.99982L14.4608 13.6644Z" fill="#525866"/></svg>`;

export function createClearButton(onClear: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.setAttribute(INSPECTOR_CLEAR_BUTTON_ATTR, 'true');
  button.style.position = 'absolute';
  button.style.right = `-4px`;
  button.style.bottom = `-${CLEAR_BUTTON_OFFSET / 2}px`;
  button.style.width = `${CLEAR_BUTTON_SIZE}px`;
  button.style.height = `${CLEAR_BUTTON_SIZE}px`;
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#FFFFFF';
  button.style.border = 'none';
  button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.pointerEvents = 'auto';
  button.style.zIndex = '1000000';
  button.style.padding = '0';

  button.innerHTML = closeIconSvg;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    onClear();
  });

  button.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  });

  return button;
}

export function createHoverOverlay(): HTMLDivElement {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.border = `1px solid ${HOVER_BORDER_COLOR}`;
  div.style.backgroundColor = 'transparent';
  div.style.pointerEvents = 'none';
  div.style.zIndex = '999999';
  div.style.transition = 'none';
  div.style.display = 'none';
  div.style.borderRadius = '2px';
  document.body.appendChild(div);
  return div;
}

export function createSelectedOverlay(selectionId: string, rect: DOMRect, onClear: () => void): HTMLDivElement {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.border = `1px solid ${SELECTED_BORDER_COLOR}`;
  div.style.backgroundColor = 'transparent';
  div.style.pointerEvents = 'none';
  div.style.zIndex = '999998';
  div.style.transition = 'none';
  div.style.left = `${rect.left}px`;
  div.style.top = `${rect.top}px`;
  div.style.width = `${rect.width}px`;
  div.style.height = `${rect.height}px`;
  div.style.borderRadius = '2px';
  div.dataset.selectionId = selectionId;

  const clearButton = createClearButton(onClear);
  div.appendChild(clearButton);

  document.body.appendChild(div);
  return div;
}
