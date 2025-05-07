// uses Pollinations AI API (https://pollinations.ai/) for image generation

const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const examplePrompts = [
    "A magic forest with glowing plants an6d fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
    "A whimsical treehouse village nestled among giant glowing mushrooms in an enchanted forest",
    "A steampunk airship docking at a Victorian sky-city made of intricate clockwork",
    "A bioluminescent coral reef teeming with bizarre and colorful deep-sea creatures",
    "A desolate Martian landscape with a lone astronaut gazing at a swirling nebula",
    "A cozy hobbit hole built into a rolling green hill with a smoking chimney",
    "A surreal dreamscape with melting clocks and floating islands in a pastel sky",
    "A majestic ice dragon soaring above snow-capped mountains under a full moon",
    "A bustling alien cantina filled with diverse and strange extraterrestrial patrons",
    "A forgotten library overgrown with vines and filled with floating books",
    "A vibrant street art mural covering the side of a futuristic skyscraper",
    "A serene Japanese garden with a stone lantern and cherry blossoms in the rain",
    "A mystical portal opening up in the middle of a dense, fog-shrouded forest.",
    "A playful group of robotic animals exploring a lush, overgrown jungle",
    "A dramatic lightning storm over a dark and stormy ocean with a lone sailboat",
    "An ancient Egyptian tomb filled with hieroglyphs and golden treasures"
];

// set theme based on saved preference or system default
(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// calculate width/height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);

    return { width: calculatedWidth, height: calculatedHeight };
}

// replace loading spinner with the actual image
const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img">
                            <div class="img-overlay">
                                <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}">
                                    <i class="fa-solid fa-download"></i>
                                </button>
                            </div>`;
}

// send requests to Pollinations AI API to create images
const generateImages = async (imageCount, aspectRatio, promptText) => {
    const { width, height } = getImageDimensions(aspectRatio);
    generateBtn.setAttribute("disabled", "true");

    // Array to store promises for image generation
    const imagePromises = [];

    for (let i = 0; i < imageCount; i++) {
        const imgCard = document.getElementById(`img-card-${i}`);
        imagePromises.push(
            new Promise(async (resolve, reject) => {
                try {
                    const encodedPrompt = encodeURIComponent(promptText);
                    const params = new URLSearchParams({
                        width: width,
                        height: height,
                        model: "flux", // Default model, adjust as needed
                        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
                        nologo: "true", // Remove Pollinations logo
                        private: "true", // Keep image private
                        enhance: "true", // Enhance prompt
                    });
                    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;

                    const response = await fetch(apiUrl, {
                        method: "GET",
                        mode: "cors", // Ensure CORS is enabled
                        headers: {
                            "Accept": "image/jpeg", // Expect image data
                        },
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Pollinations AI error: ${response.status} - ${response.statusText} - ${errorText}`);
                    }

                    // Convert response to a blob and create an object URL
                    const imageBlob = await response.blob();
                    const imageUrl = URL.createObjectURL(imageBlob);

                    // Update the image card with the generated image
                    updateImageCard(i, imageUrl);
                    resolve(imageUrl);
                } catch (error) {
                    console.error(`Error generating image ${i}:`, error);
                    if (imgCard) {
                        imgCard.classList.replace("loading", "error");
                        imgCard.querySelector(".status-text").textContent = "Generation failed!";
                    }
                    reject(error);
                }
            })
        );

        // Add a delay to avoid hitting rate limits (1 request per 5 seconds)
        if (i < imageCount - 1) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    try {
        const results = await Promise.all(imagePromises);
        console.log("All images generated successfully:", results);
    } catch (error) {
        console.error("Error generating images:", error);
    } finally {
        generateBtn.removeAttribute("disabled");
    }
};

// switch between light and dark theme
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}


// create placeholder cards with loading spinners
const createImageCards = (imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";
    const { width, height } = getImageDimensions(aspectRatio);

    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML +=
            `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio};">
                <div class="status-container">
                    <div class="spinner"></div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Generating...</p>
                </div>
            </div>`;
    }

    generateImages(imageCount, aspectRatio, promptText);
}

// handle form submissions
const handleFormSubmit = (e) => {
    e.preventDefault();

    // get form values
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    createImageCards(imageCount, aspectRatio, promptText);
}

// fill prompt input with random example
promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
