const Key = Symbol('key');

function tryDestroy(thing) {
	if (typeof thing.destroy === 'function') {
		thing.destroy();
	}
}

module.exports = function createListView(root, {key, build, items = [], debug = false}) {
	const itemCache = new Map();

	_set(items);

	return {
		set: _set,
		destroy: _destroy
	};

	function _set(newItems) {
		let insertions = 0, deletions = 0, pos = 0;

		newItems.forEach((item) => {
			item = _findOrBuild(item);
			if (root.childNodes[pos] !== item.root) {
				root.insertBefore(item.root, root.childNodes[pos] || null);
				insertions++;
			}
			pos++;
		});

		while (pos < root.childNodes.length) {
			const victim = root.lastChild;
			const key = victim[Key];
			const el = itemCache.get(key);
			itemCache.delete(key);
			tryDestroy(el);
			root.removeChild(victim);
			deletions++;
		}

		if (debug) {
			console.log("[ListView] insertions=%d, deletions=%d", insertions, deletions);
			_lint();
		}
	}

	function _lint() {
		if (itemCache.size !== root.childNodes.length) {
			console.warn("[ListView] lint failed: cache size (%d) does not match node list length (%d)", itemCache.size, root.childNodes.length);
		}
		for (let i = 0; i < root.childNodes.length; ++i) {
			const n = root.childNodes[i];
			const el = itemCache.get(n[Key]);
			if (!el) {
				console.warn("[ListView] lint failed: cache contains no entry for key", n[Key]);
			}
		}
	}

	function _destroy() {
		itemCache.forEach(el, tryDestroy);
		itemCache.clear();
		root.innerHTML = '';
	}

	function _findOrBuild(item) {
		const k = key(item);
		let el = itemCache.get(k);
		if (el) {
			if (typeof el.update === 'function') {
				el.update(el, item);
			}
		} else {
			el = build(item);
			if (el instanceof HTMLElement) {
				el = {root: el};
			}
			el.root[Key] = k;
			itemCache.set(k, el);
		}
		return el;
	}
};