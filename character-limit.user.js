// ==UserScript==
// @name         CharacterLimit
// @namespace    https://bcmc.ga/authors/tumblegamer/
// @version      0.1.0.1
// @icon         https://github.com/tumble1999/critterguration/raw/master/icon.png
// @author       TumbleGamer
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/modial/raw/master/modial.js
// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
	"use strict";

	const CharLimit = new TumbleMod({
		id: "characterLimit", // code-friendly version of name
		abriv: "CL", // abbreviation for mod.log
		//cardboard: true, // if this mod requires cardboard
	}),
		chatBoxContainer = document.createElement("div"),
		progressIndicator = document.createElement("span"),
		progressIndicatorProgress = document.createElement("div"),
		countIndicator = document.createElement("span"),
		conditionalFormattingDefault = [
			{
				min: .9,
				color: "red"
			},
			{
				min: .6,
				color: "orange"
			},
			{
				min: 0,
				color: "green"
			}
		],
		settingsContainer = Critterguration.registerSettingsMenu({ id: CharLimit.id, name: "Message Limit" });
	let conditionalFormatting = GM_getValue("charLimit_formatting") || conditionalFormattingDefault;

	// Settings
	function addSetting(i) {
		let format = conditionalFormatting[i],
			group = settingsContainer.createInputRow(i),
			percent = group.createInput("Percent", "number", value => {
				format.min = value / 100;
			}),
			color = group.createInput("Percent", "text", value => {
				format.color = value;
			}),
			delBtn = document.createElement("button");
		percent.value = format.min * 100;
		color.value = format.color;
		delBtn.classList.add("btn", "btn-danger");
		delBtn.innerText = "Delete";
		delBtn.addEventListener("click", () => {
			group.remove();
			delete conditionalFormatting[i];
		});
		group.appendChild(delBtn);
	}

	function addCondition() {
		let format = { min: 0, color: "black" },
			i = conditionalFormatting.push(format) - 1;
		addSetting(i);
	}

	function saveSettings() {
		GM_setValue("charLimit_formatting", conditionalFormatting.filter(a => void 0 != a).sort((a, b) => b.min - a.min));
		refreshSettings();
	}

	function refreshSettings() {
		let rows = Array.prototype.filter.call(settingsContainer.children, child => child.classList.contains("input-group"));
		for (const child of rows) {
			child.remove();
		}
		// Format List
		for (const i in conditionalFormatting) {
			addSetting(i);
		}
	}

	function resetSettings() {
		conditionalFormatting = conditionalFormattingDefault;
		refreshSettings();
	}

	// Add Button
	let settingAddButton = document.createElement("button");
	settingAddButton.innerText = "Add";
	settingAddButton.classList.add("btn", "btn-primary");
	settingAddButton.addEventListener("click", addCondition);
	settingsContainer.appendChild(settingAddButton);

	// Save Button
	let settingSaveButton = document.createElement("button");
	settingSaveButton.innerText = "Save";
	settingSaveButton.classList.add("btn", "btn-success");
	settingSaveButton.addEventListener("click", saveSettings);
	settingsContainer.appendChild(settingSaveButton);

	// Reset Button
	let settingResetButton = document.createElement("button");
	settingResetButton.innerText = "Reset";
	settingResetButton.classList.add("btn", "btn-warning");
	settingResetButton.addEventListener("click", resetSettings);
	settingsContainer.appendChild(settingResetButton);

	// Refresh Button
	let settingRefreshButton = document.createElement("button");
	settingRefreshButton.innerText = "Refresh";
	settingRefreshButton.classList.add("btn", "btn-secondary");
	settingRefreshButton.addEventListener("click", refreshSettings);
	settingsContainer.appendChild(settingRefreshButton);

	refreshSettings();



	// end of settings

	chatBoxContainer.style.flex = "1";
	chatBoxContainer.style.position = "relative";
	chatBoxContainer.style.display = "flex";

	countIndicator.style.position = "absolute";
	countIndicator.style.bottom = "3px";
	countIndicator.style.right = "5px";
	countIndicator.style.fontWeight = "bold";

	progressIndicator.style.position = "absolute";
	progressIndicator.style.bottom = "0";
	progressIndicator.style.width = "100%";
	progressIndicator.style.height = "6px";
	progressIndicator.appendChild(progressIndicatorProgress);

	progressIndicatorProgress.style.width = 0;
	progressIndicatorProgress.style.height = "100%";


	TumbleMod.onDocumentLoaded().then(_ => {
		let chatBox = document.getElementById("message"),
			inputGroup = chatBox.parentElement;

		inputGroup.replaceChild(chatBoxContainer, chatBox);
		inputGroup.style.display = "flex";

		chatBoxContainer.appendChild(chatBox);
		chatBoxContainer.appendChild(progressIndicator);
		chatBoxContainer.appendChild(countIndicator);

		chatBox.style.borderWidth = "3px";

		function setColor(color) {
			progressIndicatorProgress.style.backgroundColor = color;
			countIndicator.style.color = color;
			chatBox.style.borderColor = color;
		}


		chatBox.addEventListener("input", () => {
			let limit = chatBox.getAttribute("maxlength"),
				length = chatBox.value.length,
				percent = length / limit;
			countIndicator.innerText = limit - length;
			progressIndicatorProgress.style.width = 100 * percent + "%";

			for (const format of conditionalFormatting.sort((a, b) => b.min - a.min)) {
				if (!format) continue;
				let { min, color } = format;
				if (percent >= min) {
					setColor(color);
					break;
				}
			}


		});
	});
})();