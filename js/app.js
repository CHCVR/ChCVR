document.addEventListener("DOMContentLoaded", () => {
    // 1. Dual-Persona Navigation Logic
    const btnHome = document.getElementById("btn-home");
    const btnEvent = document.getElementById("btn-event");
    const pricingHome = document.getElementById("pricing-home");
    const pricingEvent = document.getElementById("pricing-event");

    if (btnHome && btnEvent) {
        btnHome.addEventListener("click", () => {
            btnHome.classList.add("active");
            btnEvent.classList.remove("active");
            pricingHome.style.display = "flex";
            pricingEvent.style.display = "none";
        });

        btnEvent.addEventListener("click", () => {
            btnEvent.classList.add("active");
            btnHome.classList.remove("active");
            pricingHome.style.display = "none";
            pricingEvent.style.display = "flex";
        });

        // Default state
        pricingEvent.style.display = "none";
    }

    // 2. State Management for Experience Variants
    const savedTheme = localStorage.getItem("vr-theme") || "sci-fi";
    document.body.setAttribute("data-theme", savedTheme);

    const variantBtns = document.querySelectorAll(".variant-btn");
    if (variantBtns.length > 0) {
        // Set initial active state based on saved theme
        variantBtns.forEach(btn => {
            if (btn.getAttribute("data-variant") === savedTheme) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        variantBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                variantBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const selectedTheme = btn.getAttribute("data-variant");
                document.body.setAttribute("data-theme", selectedTheme);
                localStorage.setItem("vr-theme", selectedTheme);
            });
        });
    }

    // 5. Tally Engine Logic (Pricing Page)
    const tallyEngine = document.getElementById("pricing");
    const liveTotal = document.getElementById("live-total");
    
    if (tallyEngine && liveTotal) {
        // Personas
        const btnTallyHome = document.getElementById("btn-tally-home");
        const btnTallyEvent = document.getElementById("btn-tally-event");
        const configHome = document.getElementById("config-home");
        const configEvent = document.getElementById("config-event");
        let isEventMode = false;

        // Modals
        const modalOverlay = document.getElementById("modal-overlay");
        const enterpriseModal = document.getElementById("enterprise-modal");
        const btnCloseModal = document.getElementById("btn-close-modal");
        
        // Displays & Buttons
        const breakdownMenu = document.getElementById("breakdown-menu");
        const breakdownToggle = document.getElementById("breakdown-toggle");
        const btnReserve = document.getElementById("btn-reserve");
        const tallyTitle = document.querySelector(".tally-title");

        // --- HOME VARIABLES ---
        let hours = 2;
        const hoursDisplay = document.getElementById("hours-display");
        const btnMinus = document.getElementById("btn-minus");
        const btnPlus = document.getElementById("btn-plus");
        const durationError = document.getElementById("duration-error");
        let addOns = { haptics: false, weapon: false };
        const HOME_BASE = 300, HOME_HOURLY = 125, HOME_LOGISTICS = 95;

        // --- EVENT VARIABLES ---
        let eventBlock = "half"; // half or full
        let eventUnits = 1;
        let eventDays = 1;
        let eventAttendant = false;
        let eventOutdoor = false;
        const EVENT_HALF = 850, EVENT_FULL = 1500, ATTENDANT_HOURLY = 50;
        
        const btnHalfDay = document.getElementById("btn-half-day");
        const btnFullDay = document.getElementById("btn-full-day");
        
        const btnUnitMinus = document.getElementById("btn-unit-minus");
        const btnUnitPlus = document.getElementById("btn-unit-plus");
        const unitsDisplay = document.getElementById("units-display");
        
        const btnDayMinus = document.getElementById("btn-day-minus");
        const btnDayPlus = document.getElementById("btn-day-plus");
        const daysDisplay = document.getElementById("days-display");

        // Hover tracking
        const allHoverCards = document.querySelectorAll(".config-card");
        const previewImg = document.getElementById("preview-image");
        const previewTitle = document.getElementById("preview-title");
        const previewDesc = document.getElementById("preview-desc");

        // Mode Switching
        btnTallyHome.addEventListener("click", () => {
            isEventMode = false;
            btnTallyHome.classList.add("active");
            btnTallyEvent.classList.remove("active");
            configHome.style.display = "block";
            configEvent.style.display = "none";
            tallyTitle.innerText = "INVESTMENT IN IMMERSION";
            btnReserve.innerText = "ENTER THE SIMULATION";
            btnReserve.style.display = "block";
            const bannerImg = document.getElementById("persona-banner-img");
            const bannerVid = document.getElementById("persona-banner-vid");
            if(bannerImg && bannerVid) {
                bannerImg.style.opacity = '0';
                setTimeout(() => { 
                    bannerImg.style.display = "none";
                    bannerVid.style.display = "block";
                    bannerVid.play();
                    setTimeout(() => bannerVid.style.opacity = '0.9', 50);
                }, 200);
            }
            updateTally();
        });

        btnTallyEvent.addEventListener("click", () => {
            isEventMode = true;
            btnTallyEvent.classList.add("active");
            btnTallyHome.classList.remove("active");
            configHome.style.display = "none";
            configEvent.style.display = "block";
            tallyTitle.innerText = "EVENT SERVICE TOTAL";
            btnReserve.innerText = "GENERATE FORMAL QUOTE / BOOK NOW";
            btnReserve.style.display = "block";
            const bannerImg = document.getElementById("persona-banner-img");
            const bannerVid = document.getElementById("persona-banner-vid");
            if(bannerImg && bannerVid) {
                bannerVid.style.opacity = '0';
                setTimeout(() => { 
                    bannerVid.pause();
                    bannerVid.style.display = "none";
                    bannerImg.style.display = "block";
                    setTimeout(() => bannerImg.style.opacity = '0.9', 50);
                }, 200);
            }
            updateTally();
        });

        // Connect 'Enter the Simulation' button to checkout portal
        btnReserve.addEventListener("click", () => {
            if (btnReserve.disabled) return;
            
            const payload = {
                mode: isEventMode ? "event" : "home",
                finalTotal: parseFloat(liveTotal.innerText)
            };

            if (isEventMode) {
                payload.units = eventUnits;
                payload.days = eventDays;
                payload.attendant = eventAttendant;
                payload.outdoor = eventOutdoor;
                payload.eventBlock = eventBlock; 
            } else {
                payload.hours = hours;
                payload.haptics = addOns.haptics;
                payload.weapon = addOns.weapon;
                payload.deposit = (payload.finalTotal * 0.20).toFixed(2);
            }

            localStorage.setItem("vr_checkout_payload", JSON.stringify(payload));
            window.location.href = "checkout.html";
        });

        const checkEnterpriseTrigger = () => {
            if (isEventMode && (eventDays >= 3 || eventUnits >= 4)) {
                modalOverlay.style.display = "block";
                enterpriseModal.style.display = "block";
                btnReserve.style.display = "none";
                liveTotal.innerText = "CUSTOM QUOTE";
                breakdownMenu.style.display = "none";
                return true; // Triggered
            }
            btnReserve.style.display = "block";
            return false; // Not triggered
        };

        btnCloseModal.addEventListener("click", () => {
            modalOverlay.style.display = "none";
            enterpriseModal.style.display = "none";
            // Auto revert logic to bypass trigger limits when closed
            if (eventDays >= 3) eventDays = 2;
            if (eventUnits >= 4) eventUnits = 3;
            daysDisplay.innerText = eventDays;
            unitsDisplay.innerText = eventUnits;
            updateTally();
        });

        const updateTally = () => {
            if (checkEnterpriseTrigger()) return;

            if (!isEventMode) {
                // Home Logic
                let hardwareCost = HOME_BASE;
                if (hours > 2) hardwareCost += (hours - 2) * HOME_HOURLY;
                
                let hapticsCost = addOns.haptics ? 60 : 0;
                let weaponCost = addOns.weapon ? 40 : 0;
                let subtotal = hardwareCost + hapticsCost + weaponCost + HOME_LOGISTICS;
                let finalTotal = subtotal;
                
                liveTotal.innerText = finalTotal.toFixed(2);
                
                breakdownMenu.innerHTML = `
                    <div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="Complete VR locomotion hardware stack.">Base System (${hours} hrs)</span><span>$${hardwareCost.toFixed(2)}</span></div>
                    ${addOns.haptics ? '<div class="bd-row"><span>Tactical Haptics</span><span>$60.00</span></div>' : ''}
                    ${addOns.weapon ? '<div class="bd-row"><span>Weaponry System</span><span>$40.00</span></div>' : ''}
                    <div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="Delivery, exact calibration, and teardown.">White-Glove Logistics (Required)</span><span>$95.00</span></div>
                `;
                
                if (hours < 2) {
                    btnReserve.disabled = true;
                    btnReserve.style.opacity = '0.5';
                    btnReserve.style.cursor = 'not-allowed';
                    btnReserve.innerText = "CALIBRATION REQUIRED";
                    durationError.style.display = 'block';
                } else {
                    btnReserve.disabled = false;
                    btnReserve.style.opacity = '1';
                    btnReserve.style.cursor = 'pointer';
                    btnReserve.innerText = "ENTER THE SIMULATION";
                    durationError.style.display = 'none';
                }
            } else {
                // Event Logic
                let blockRate = eventBlock === "half" ? EVENT_HALF : EVENT_FULL;
                let hardwareTotal = blockRate * eventUnits * eventDays;
                
                let attendantHours = eventBlock === "half" ? 4 : 8;
                let totalAttendantHours = attendantHours * eventDays;
                let attendantCost = eventAttendant ? (ATTENDANT_HOURLY * totalAttendantHours) : 0;
                let outdoorCost = eventOutdoor ? 300 : 0;
                
                let finalTotal = hardwareTotal + attendantCost + outdoorCost;
                
                liveTotal.innerText = finalTotal.toFixed(2);
                
                breakdownMenu.innerHTML = `
                    <div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="Includes KAT mini S, VIVE Focus Vision, bHaptics TactSuit Pro, and StrikerVR weaponry.">Hardware (${eventUnits} Units x ${eventDays} Days)</span><span>$${hardwareTotal.toFixed(2)}</span></div>
                    ${eventOutdoor ? '<div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="Includes canopy, generator, router, temperature controlled environment">Outdoor Protocol</span><span>$300.00</span></div>' : ''}
                    ${eventAttendant ? '<div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="A designated professional managing safety, throughput, and technical support.">Game Master Service (' + totalAttendantHours + ' Hrs)</span><span>$' + attendantCost.toFixed(2) + '</span></div>' : ''}
                    <div class="bd-row"><span class="bd-tooltip-wrapper" data-tooltip="Delivery, exact calibration, and teardown.">White-Glove Logistics & Calibration</span><span>INCLUDED</span></div>
                `;
                
                btnReserve.disabled = false;
                btnReserve.style.opacity = '1';
                durationError.style.display = 'none';
            }
        };

        // Home Counters
        btnMinus.addEventListener("click", () => { hours = Math.max(1, hours - 1); hoursDisplay.innerText = hours; updateTally(); });
        btnPlus.addEventListener("click", () => { hours++; hoursDisplay.innerText = hours; updateTally(); });
        
        // Event Counters & Buttons
        btnHalfDay.addEventListener("click", () => { eventBlock = "half"; btnHalfDay.classList.add("active"); btnFullDay.classList.remove("active"); updateTally(); });
        btnFullDay.addEventListener("click", () => { eventBlock = "full"; btnFullDay.classList.add("active"); btnHalfDay.classList.remove("active"); updateTally(); });
        btnUnitMinus.addEventListener("click", () => { eventUnits = Math.max(1, eventUnits - 1); unitsDisplay.innerText = eventUnits; updateTally(); });
        btnUnitPlus.addEventListener("click", () => { eventUnits++; unitsDisplay.innerText = eventUnits; updateTally(); });
        btnDayMinus.addEventListener("click", () => { eventDays = Math.max(1, eventDays - 1); daysDisplay.innerText = eventDays; updateTally(); });
        btnDayPlus.addEventListener("click", () => { eventDays++; daysDisplay.innerText = eventDays; updateTally(); });
        
        breakdownToggle.addEventListener("click", () => {
            breakdownMenu.style.display = breakdownMenu.style.display === "none" ? "block" : "none";
        });

        // Hover & Toggles (Universal)
        allHoverCards.forEach(card => {
            card.addEventListener("mouseenter", () => {
                const img = card.getAttribute("data-img");
                if (!img) return; // Only process cards with data-img
                previewImg.style.opacity = '0';
                setTimeout(() => {
                    previewImg.src = img;
                    previewTitle.innerText = card.getAttribute("data-title");
                    previewDesc.innerText = card.getAttribute("data-desc");
                    previewImg.style.opacity = '1';
                }, 150);
            });
            
            card.addEventListener("mouseleave", () => {
                const isConfigH = configHome.style.display !== "none";
                previewImg.style.opacity = '0';
                setTimeout(() => {
                    previewImg.src = isConfigH ? "assets/katminis.png" : "assets/Fun1.png";
                    previewTitle.innerText = isConfigH ? "KAT WALK MINI S BASE" : "THE EVENT SETUP";
                    previewDesc.innerText = isConfigH ? "Full 360° locomotion + VIVE Focus Vision + PC Rig" : "Includes KAT mini S, VIVE Focus Vision, bHaptics TactSuit Pro, and StrikerVR weaponry.";
                    previewImg.style.opacity = '1';
                }, 150);
            });
        });

        const allToggleCards = document.querySelectorAll(".toggle-card");
        allToggleCards.forEach(card => {
            card.addEventListener("click", () => {
                const item = card.getAttribute("data-item");
                
                if (item === "attendant") {
                    eventAttendant = !eventAttendant;
                    card.classList.toggle("selected", eventAttendant);
                    card.querySelector(".toggle-switch").classList.toggle("on", eventAttendant);
                } else if (item === "outdoor") {
                    eventOutdoor = !eventOutdoor;
                    card.classList.toggle("selected", eventOutdoor);
                    card.querySelector(".toggle-switch").classList.toggle("on", eventOutdoor);
                } else {
                    addOns[item] = !addOns[item];
                    card.classList.toggle("selected", addOns[item]);
                    card.querySelector(".toggle-switch").classList.toggle("on", addOns[item]);
                    if (addOns[item] && item === "haptics") {
                        document.body.classList.remove("shake-screen");
                        void document.body.offsetWidth;
                        document.body.classList.add("shake-screen");
                    }
                }
                updateTally();
            });
        });
        
        updateTally();
    }

    // 3. Momentum Scroll & Parallax / WebP Sequence logic
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return; // Prevent canvas errors on non-hero pages
    const ctx = canvas.getContext("2d");
    
    const frameCount = 240;
    const images = [];
    let imagesLoaded = 0;
    
    // Preload all frames
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        const frameIndex = i.toString().padStart(3, '0');
        img.src = `assets/sequence/frame_${frameIndex}.png`;
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === 1) {
                // Render first frame immediately
                resizeCanvas();
            }
        };
        images.push(img);
    }
    
    let canvasWidth, canvasHeight;
    
    const resizeCanvas = () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        renderCanvasFrame();
    };

    window.addEventListener("resize", resizeCanvas);

    let scrollY = window.scrollY;
    let targetScrollY = scrollY;
    let isAnimating = false;

    // Smooth scroll interpolation (Momentum)
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const renderCanvasFrame = () => {
        // Calculate scroll progress for the hero section (0 to 1)
        // 400vh total height, so 300vh scrollable distance
        const maxScrollDist = window.innerHeight * 3;
        const scrollProgress = Math.min(scrollY / maxScrollDist, 1);
        
        // Map scroll to frame index (0 to 239)
        let frameIndex = Math.floor(scrollProgress * (frameCount - 1));
        if (frameIndex < 0) frameIndex = 0;
        if (frameIndex >= frameCount) frameIndex = frameCount - 1;
        
        const currentImg = images[frameIndex];
        
        if (!currentImg || !currentImg.complete || currentImg.naturalWidth === 0) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Scale from 1.25 to 1.4 based on scroll Progress to add a subtle zoom effect while scrubbing
        // and aggressively crop any awkward empty space natively baked into the frame sequences
        const scale = 1.25 + (scrollProgress * 0.15);
        
        const imgAspect = currentImg.width / currentImg.height;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawW, drawH;
        if (canvasAspect > imgAspect) {
            drawW = canvasWidth * scale;
            drawH = (canvasWidth / imgAspect) * scale;
        } else {
            drawH = canvasHeight * scale;
            drawW = (canvasHeight * imgAspect) * scale;
        }

        // Center the asset natively on the canvas coordinates
        const drawX = (canvasWidth - drawW) / 2;
        const drawY = (canvasHeight - drawH) / 2;

        ctx.drawImage(currentImg, drawX, drawY, drawW, drawH);
    };

    const updateParallax = () => {
        const bgLayer = document.querySelector(".parallax-bg");
        const hudLayer = document.querySelector(".parallax-hud");
        
        // 3 Layers parallax speed differences
        bgLayer.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
        hudLayer.style.transform = `translateY(${scrollY * 0.1}px)`;
    };



    const loop = () => {
        // Momentum scroll interpolation
        scrollY = lerp(scrollY, targetScrollY, 0.1);
        
        // Only update DOM/Canvas if there is a noticeable difference
        if (Math.abs(scrollY - targetScrollY) > 0.1) {
            renderCanvasFrame();
            updateParallax();
            isAnimating = true;
            requestAnimationFrame(loop);
        } else {
            scrollY = targetScrollY;
            isAnimating = false;
        }
    };

    window.addEventListener("scroll", () => {
        targetScrollY = window.scrollY;
        if (!isAnimating) {
            requestAnimationFrame(loop);
        }
    }, { passive: true });

    // Initial Render
    renderCanvasFrame();
});
