const createListView = require('../');

window.boot = () => {
	const ui = {
		input: document.querySelector('textarea'),
		button: document.querySelector('input[type="submit"]'),
		list: document.querySelector('ul')
	};

	ui.button.onclick = (evt) => {
		evt.preventDefault();
		const data = ui.input.value
			.split("\n")
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.map(line => {
				const chunks = line.split(',').map(term => term.trim());
				return [parseInt(chunks[0], 10), chunks[1]];
			});
		list.set(data);
	};

	const list = createListView(ui.list, {
		debug: true,
		key(item) {
			return item[0];
		},
		build(item) {
			const li = document.createElement('li');
			li.textContent = `${item[0]} - ${item[1]}`;
			li.style.backgroundColor = 'red';
			return {
				root: li,
				update(el, item) {
					el.root.style.backgroundColor = 'green';
					el.root.textContent = `${item[0]} - ${item[1]}`;
				},
				destroy() {

				}
			}
		},
	});
};