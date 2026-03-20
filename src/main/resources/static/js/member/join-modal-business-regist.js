document.addEventListener('DOMContentLoaded', () => {
  const nextButton = document.querySelector('.next-button');
  const inputs = Array.from(document.querySelectorAll('.name-input, .phone-input'));

  if (!nextButton || inputs.length === 0) return;

  const searchButton = document.getElementById('addr-search-btn');
  if (searchButton) {
    searchButton.style.display = 'none';
  }

  const textOverrides = {
    postcode: '국가 또는 리전',
    'addr-main': '주소 라인 1',
    'addr-detail': '주소 라인 2',
  };

  Object.entries(textOverrides).forEach(([id, text]) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.readOnly = false;
    const label = input.closest('.name-placeholder, .phone-placeholder');
    const labelText = label?.querySelector('.name-text-in, .phone-text-in');
    if (labelText) labelText.textContent = text;
  });

  const shrink = (label) => {
    if (!label) return;
    label.style.fontSize = '12px';
    label.style.paddingTop = '8px';
    label.style.color = 'rgb(29, 155, 240)';
  };

  const expand = (label) => {
    if (!label) return;
    label.style.fontSize = '17px';
    label.style.paddingTop = '16px';
    label.style.color = 'rgb(83, 100, 113)';
  };

  const setFocus = (box) => {
    if (!box) return;
    box.style.borderColor = 'rgb(29, 155, 240)';
    box.style.borderWidth = '2px';
  };

  const setNeutral = (box) => {
    if (!box) return;
    box.style.borderColor = 'rgb(207, 217, 222)';
    box.style.borderWidth = '1px';
  };

  const syncNextButton = () => {
    const allFilled = inputs.every((input) => input.value.trim().length > 0);
    nextButton.disabled = !allFilled;
    nextButton.style.backgroundColor = 'rgb(15, 20, 25)';
    nextButton.style.opacity = allFilled ? '1' : '0.5';
    nextButton.style.cursor = allFilled ? 'pointer' : 'default';
  };

  inputs.forEach((input) => {
    const labelBox = input.closest('.name-placeholder, .phone-placeholder');
    const labelText = labelBox?.querySelector('.name-text, .phone-text');

    if (input.value.trim().length > 0) {
      shrink(labelText);
    } else {
      expand(labelText);
    }

    input.addEventListener('focus', () => {
      shrink(labelText);
      setFocus(labelBox);
    });

    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        shrink(labelText);
      }
      syncNextButton();
    });

    input.addEventListener('blur', () => {
      setNeutral(labelBox);
      if (input.value.trim().length === 0) {
        expand(labelText);
      }
      syncNextButton();
    });
  });

  syncNextButton();
});
