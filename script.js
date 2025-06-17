document.addEventListener("DOMContentLoaded", () => {
  // --- GLOBAL UI ELEMENTS ---
  const hamburger = document.getElementById("hamburger-menu");
  const navLinks = document.querySelector(".nav-links");
  const modal = document.getElementById("tool-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalStatus = document.getElementById("modal-status");
  const modalCloseBtn = document.querySelector(".modal-close-btn");
  const openToolButtons = document.querySelectorAll(
    ".open-tool-btn, .tool-link"
  );

  // --- RESPONSIVE NAVBAR ---
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
  });

  // --- MODAL HANDLING ---
  const openModal = () => modal.classList.add("active");
  const closeModal = () => {
    modal.classList.remove("active");
    // Clear content to prevent old data from flashing
    modalBody.innerHTML = "";
    modalStatus.innerHTML = "";
  };

  modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // --- TOOL DISPATCHER ---
  openToolButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const toolId = button.dataset.tool;
      loadTool(toolId);
    });
  });

  function loadTool(toolId) {
    // Default UI reset
    modalBody.innerHTML = "";
    modalStatus.innerHTML = "";

    const tool = toolImplementations[toolId];
    if (tool) {
      modalTitle.textContent = tool.title;
      modalBody.innerHTML = tool.ui;
      if (tool.init) {
        tool.init();
      }
      openModal();
    } else {
      alert("Tool not found!");
    }
  }

  // --- SIMULATED TOOL UI HELPER ---
  const createSimulatedToolUI = (fileType, multiple = true) => `
        <div class="file-drop-area" id="file-drop-area">
            <p>Drag & Drop your ${fileType.toUpperCase()} file(s) here or click to select</p>
            <input type="file" id="file-input" accept="${
              fileType === "pdf" ? ".pdf" : "*"
            }" ${multiple ? "multiple" : ""}>
        </div>
        <div id="file-list"></div>
        <button id="process-btn" class="cta-button" disabled>Process Files</button>
    `;

  const handleSimulatedProcessing = (btnId) => {
    const processBtn = document.getElementById(btnId);
    const fileInput = document.getElementById("file-input");
    const fileListDisplay = document.getElementById("file-list");

    const updateButtonState = () => {
      processBtn.disabled = fileInput.files.length === 0;
    };

    fileInput.addEventListener("change", () => {
      fileListDisplay.innerHTML = [...fileInput.files]
        .map((f) => `<p>${f.name}</p>`)
        .join("");
      updateButtonState();
    });

    // Drag & Drop
    const dropArea = document.getElementById("file-drop-area");
    dropArea.addEventListener("click", () => fileInput.click());
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false
      );
    });
    ["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        () => dropArea.classList.add("dragover"),
        false
      );
    });
    ["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        () => dropArea.classList.remove("dragover"),
        false
      );
    });
    dropArea.addEventListener(
      "drop",
      (e) => {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
      },
      false
    );

    processBtn.addEventListener("click", () => {
      modalStatus.textContent = "Uploading...";
      setTimeout(() => {
        modalStatus.textContent = "Processing... This may take a moment.";
      }, 1500);
      setTimeout(() => {
        modalStatus.innerHTML = `✅ Processing Complete! <br><small>(This is a frontend demo. No file was actually processed.)</small>`;
      }, 4000);
    });
  };

  // --- TOOL IMPLEMENTATIONS OBJECT ---
  const toolImplementations = {
    // --- PDF TOOLS (SIMULATED) ---
    "merge-pdf": {
      title: "Merge PDF",
      ui: createSimulatedToolUI("pdf"),
      init: () => handleSimulatedProcessing("process-btn"),
    },
    "split-pdf": {
      title: "Split PDF",
      ui: createSimulatedToolUI("pdf", false),
      init: () => handleSimulatedProcessing("process-btn"),
    },
    "compress-pdf": {
      title: "Compress PDF",
      ui: createSimulatedToolUI("pdf"),
      init: () => handleSimulatedProcessing("process-btn"),
    },
    "pdf-to-word": {
      title: "PDF to Word",
      ui: createSimulatedToolUI("pdf"),
      init: () => handleSimulatedProcessing("process-btn"),
    },
    "pdf-to-jpg": {
      title: "PDF to JPG",
      ui: createSimulatedToolUI("pdf"),
      init: () => handleSimulatedProcessing("process-btn"),
    },
    "protect-pdf": {
      title: "Protect PDF",
      ui:
        createSimulatedToolUI("pdf", false) +
        `<input type="password" id="pdf-password" placeholder="Enter password to set" style="margin-top: 1rem;">`,
      init: () => handleSimulatedProcessing("process-btn"),
    },

    // --- UTILITY TOOLS (FUNCTIONAL) ---
    "image-compressor": {
      title: "Image Compressor",
      ui: `
                ${createSimulatedToolUI("image", false)}
                <label for="quality-slider">Quality (0.1 - 1.0): <span id="quality-value">0.7</span></label>
                <input type="range" id="quality-slider" min="0.1" max="1.0" value="0.7" step="0.1">
                <img id="image-preview" src="" alt="Image Preview" style="display: none;">
                <a id="download-btn" class="cta-button" style="display:none; text-align: center;">Download Compressed Image</a>
            `,
      init: () => {
        const fileInput = document.getElementById("file-input");
        const qualitySlider = document.getElementById("quality-slider");
        const qualityValue = document.getElementById("quality-value");
        const preview = document.getElementById("image-preview");
        const downloadBtn = document.getElementById("download-btn");
        const processBtn = document.getElementById("process-btn");

        let originalFile = null;

        qualitySlider.addEventListener("input", () => {
          qualityValue.textContent = qualitySlider.value;
        });

        fileInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            originalFile = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
              preview.src = event.target.result;
              preview.style.display = "block";
              processBtn.disabled = false;
            };
            reader.readAsDataURL(originalFile);
          }
        });

        processBtn.addEventListener("click", () => {
          if (!originalFile) return;
          modalStatus.textContent = "Compressing...";

          const img = new Image();
          img.src = preview.src;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const quality = parseFloat(qualitySlider.value);
            canvas.toBlob(
              (blob) => {
                const url = URL.createObjectURL(blob);
                downloadBtn.href = url;
                downloadBtn.download = `Boxlet - compressed_${originalFile.name}`;
                downloadBtn.style.display = "block";
                modalStatus.textContent = `✅ Compression Complete! Original: ${(
                  originalFile.size / 1024
                ).toFixed(1)}KB, New: ${(blob.size / 1024).toFixed(1)}KB`;
              },
              "image/jpeg",
              quality
            );
          };
        });

        // Also add drag/drop
        const dropArea = document.getElementById("file-drop-area");
        dropArea.addEventListener("click", () => fileInput.click());
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) =>
          dropArea.addEventListener(
            eventName,
            (e) => {
              e.preventDefault();
              e.stopPropagation();
            },
            false
          )
        );
        dropArea.addEventListener("dragover", () =>
          dropArea.classList.add("dragover")
        );
        dropArea.addEventListener("dragleave", () =>
          dropArea.classList.remove("dragover")
        );
        dropArea.addEventListener("drop", (e) => {
          dropArea.classList.remove("dragover");
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event("change"));
        });
      },
    },
    "qr-generator": {
      title: "QR Code Generator",
      ui: `
                <p>Enter text or a URL to generate a QR code.</p>
                <input type="text" id="qr-text" placeholder="https://example.com">
                <button id="generate-qr-btn" class="cta-button">Generate</button>
                <div id="qr-code-container" style="display:none;"></div>
            `,
      init: () => {
        document
          .getElementById("generate-qr-btn")
          .addEventListener("click", () => {
            const text = document.getElementById("qr-text").value;
            const container = document.getElementById("qr-code-container");
            if (!text) {
              modalStatus.textContent = "Please enter some text or a URL.";
              return;
            }
            modalStatus.textContent = "Generating...";
            container.innerHTML = "";
            // Using a public API for QR generation to avoid heavy libraries
            const img = document.createElement("img");
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              text
            )}`;
            img.onload = () => {
              container.appendChild(img);
              container.style.display = "block";
              modalStatus.textContent = "✅ QR Code Generated!";
            };
            img.onerror = () => {
              modalStatus.textContent = "❌ Error generating QR code.";
            };
          });
      },
    },
    "password-generator": {
      title: "Password Generator",
      ui: `
                <div class="password-result">
                    <input type="text" id="password-output" readonly placeholder="Your new password...">
                    <button id="copy-btn" class="cta-button" style="margin-top:0; padding: 0.8rem;">Copy</button>
                </div>
                <label for="length">Length: <span id="length-val">16</span></label>
                <input type="range" id="length" min="8" max="64" value="16">
                <div>
                    <input type="checkbox" id="uppercase" checked> <label for="uppercase">Uppercase (A-Z)</label>
                </div>
                <div>
                    <input type="checkbox" id="lowercase" checked> <label for="lowercase">Lowercase (a-z)</label>
                </div>
                <div>
                    <input type="checkbox" id="numbers" checked> <label for="numbers">Numbers (0-9)</label>
                </div>
                <div>
                    <input type="checkbox" id="symbols"> <label for="symbols">Symbols (!@#$...)</label>
                </div>
                <button id="generate-pass-btn" class="cta-button">Generate Password</button>
            `,
      init: () => {
        const lengthSlider = document.getElementById("length");
        const lengthVal = document.getElementById("length-val");
        lengthSlider.addEventListener(
          "input",
          () => (lengthVal.textContent = lengthSlider.value)
        );

        document
          .getElementById("generate-pass-btn")
          .addEventListener("click", () => {
            const length = +lengthSlider.value;
            const hasUpper = document.getElementById("uppercase").checked;
            const hasLower = document.getElementById("lowercase").checked;
            const hasNumbers = document.getElementById("numbers").checked;
            const hasSymbols = document.getElementById("symbols").checked;
            const output = document.getElementById("password-output");

            output.value = generatePassword(
              hasUpper,
              hasLower,
              hasNumbers,
              hasSymbols,
              length
            );
            modalStatus.textContent = "✅ New password generated!";
          });

        document.getElementById("copy-btn").addEventListener("click", () => {
          const password = document.getElementById("password-output").value;
          if (!password) return;
          navigator.clipboard.writeText(password).then(() => {
            modalStatus.textContent = "✅ Password copied to clipboard!";
          });
        });

        function generatePassword(upper, lower, number, symbol, length) {
          let generatedPassword = "";
          const typesCount = upper + lower + number + symbol;
          if (typesCount === 0) return "";

          const charSets = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            number: "0123456789",
            symbol: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
          };

          let allChars = "";
          if (upper) allChars += charSets.upper;
          if (lower) allChars += charSets.lower;
          if (number) allChars += charSets.number;
          if (symbol) allChars += charSets.symbol;

          for (let i = 0; i < length; i++) {
            generatedPassword += allChars.charAt(
              Math.floor(Math.random() * allChars.length)
            );
          }
          return generatedPassword;
        }
      },
    },
    "word-counter": {
      title: "Word & Character Counter",
      ui: `
                <textarea id="text-input" rows="8" placeholder="Paste your text here..."></textarea>
                <div id="count-results" style="text-align: center; margin-top: 1rem; font-family: var(--font-futuristic);">
                    Words: 0 | Characters: 0 | Sentences: 0
                </div>
            `,
      init: () => {
        document.getElementById("text-input").addEventListener("input", (e) => {
          const text = e.target.value;
          const words = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
          const chars = text.length;
          const sentences = (text.match(/[.!?]+/g) || []).length;
          document.getElementById(
            "count-results"
          ).textContent = `Words: ${words} | Characters: ${chars} | Sentences: ${sentences}`;
        });
      },
    },
    "text-to-speech": {
      title: "Text to Speech",
      ui: `
                <textarea id="tts-text" rows="6" placeholder="Type or paste text to be spoken..."></textarea>
                <select id="tts-voices"></select>
                <button id="speak-btn" class="cta-button">Speak</button>
            `,
      init: () => {
        const synth = window.speechSynthesis;
        const voiceSelect = document.getElementById("tts-voices");
        let voices = [];

        function populateVoiceList() {
          voices = synth.getVoices();
          voiceSelect.innerHTML = "";
          voices.forEach((voice) => {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute("data-lang", voice.lang);
            option.setAttribute("data-name", voice.name);
            voiceSelect.appendChild(option);
          });
        }

        populateVoiceList();
        if (synth.onvoiceschanged !== undefined) {
          synth.onvoiceschanged = populateVoiceList;
        }

        document.getElementById("speak-btn").addEventListener("click", () => {
          if (synth.speaking) {
            synth.cancel();
          }
          const text = document.getElementById("tts-text").value;
          if (text !== "") {
            const utterThis = new SpeechSynthesisUtterance(text);
            const selectedOption =
              voiceSelect.selectedOptions[0].getAttribute("data-name");
            utterThis.voice = voices.find(
              (voice) => voice.name === selectedOption
            );
            synth.speak(utterThis);
          }
        });
      },
    },
    stopwatch: {
      title: "Stopwatch / Timer",
      ui: `
                <div id="stopwatch-display" style="font-size: 3rem; text-align: center; font-family: var(--font-futuristic); letter-spacing: 4px;">00:00:00.00</div>
                <div style="display:flex; justify-content:center; gap: 1rem; margin-top: 1rem;">
                    <button id="start-stop-btn" class="cta-button">Start</button>
                    <button id="reset-btn" class="cta-button">Reset</button>
                </div>
            `,
      init: () => {
        let startTime, updatedTime, difference, tInterval;
        let running = false;
        const display = document.getElementById("stopwatch-display");
        const startStopBtn = document.getElementById("start-stop-btn");
        const resetBtn = document.getElementById("reset-btn");

        function startStop() {
          if (!running) {
            startTime = new Date().getTime() - (difference || 0);
            tInterval = setInterval(getShowTime, 10);
            running = true;
            startStopBtn.textContent = "Pause";
          } else {
            clearInterval(tInterval);
            running = false;
            startStopBtn.textContent = "Start";
          }
        }

        function reset() {
          clearInterval(tInterval);
          running = false;
          difference = 0;
          display.innerHTML = "00:00:00.00";
          startStopBtn.textContent = "Start";
        }

        function getShowTime() {
          updatedTime = new Date().getTime();
          difference = updatedTime - startTime;
          let hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          let minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          let seconds = Math.floor((difference % (1000 * 60)) / 1000);
          let milliseconds = Math.floor((difference % 1000) / 10);

          hours = hours < 10 ? "0" + hours : hours;
          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;
          milliseconds = milliseconds < 10 ? "0" + milliseconds : milliseconds;
          display.innerHTML = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        }

        startStopBtn.addEventListener("click", startStop);
        resetBtn.addEventListener("click", reset);
      },
    },
  };
});
