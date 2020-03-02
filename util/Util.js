module.exports = class Util {
	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	static removeFromArray(arr, value) {
		return arr.splice(arr.indexOf(value), 1);
	}

	static firstUpperCase(text) {
		return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
	}
};
