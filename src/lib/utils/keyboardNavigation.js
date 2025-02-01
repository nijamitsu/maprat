export function setupKeyboardNavigation(
	node,
	{ options, onSelect, onClose, searchInputId, optionButtonClass }
) {
	let currentIndex = -1;
	let currentOptions = options; // Store options reference

	function handleKeydown(event) {
		if (!currentOptions?.length) return; // Use currentOptions

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				currentIndex = currentIndex >= currentOptions.length - 1 ? 0 : currentIndex + 1; // Use currentOptions
				updateHighlight();
				break;

			case 'ArrowUp':
				event.preventDefault();
				currentIndex = currentIndex <= 0 ? currentOptions.length - 1 : currentIndex - 1; // Use currentOptions
				updateHighlight();
				break;

			case 'Enter':
				event.preventDefault();
				if (currentIndex >= 0) {
					onSelect(currentOptions[currentIndex]); // Use currentOptions
				}
				break;

			case 'Escape':
				event.preventDefault();
				if (typeof onClose === 'function') {
					onClose();
				}
				break;
		}
	}

	function updateHighlight() {
		const items = node.querySelectorAll(optionButtonClass);
		items.forEach((item, index) => {
			item.classList.toggle('highlighted', index === currentIndex);
		});

		// Scroll into view if needed
		if (currentIndex >= 0) {
			items[currentIndex].scrollIntoView({ block: 'nearest' });
		}
	}

	function handleClickOutside(event) {
		// Check if node is a valid DOM element and onClose exists
		if (!node || !(node instanceof Element) || typeof onClose !== 'function') return;

		if (!node.contains(event.target) && event.target !== searchInputId) {
			onClose();
		}
	}

	function handleVisibilityChange() {
		// Only close if the page is visible and the document doesn't have focus
		if (
			typeof onClose === 'function' &&
			document.visibilityState === 'visible' &&
			!document.hasFocus() &&
			!document.activeElement?.contains(node) && // Check if focus is not within dropdown
			document.activeElement !== searchInputId
		) {
			// Check if focus is not on search input
			onClose();
		}
	}

	// Setup event listeners
	document.addEventListener('keydown', handleKeydown);
	document.addEventListener('click', handleClickOutside);
	document.addEventListener('contextmenu', handleClickOutside);
	document.addEventListener('visibilitychange', handleVisibilityChange);

	return {
		update({ options: newOptions }) {
			// Rename parameter to avoid shadowing
			currentOptions = newOptions || []; // Update the options reference
			currentIndex = -1;
			updateHighlight();
		},
		destroy() {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('contextmenu', handleClickOutside);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		}
	};
}
