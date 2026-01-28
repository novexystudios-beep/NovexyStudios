// Toggle Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// SCROLL SPY LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", () => {
        let current = "";
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            // Offset of 150px to trigger the switch early
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            link.style.color = "var(--text-white)";
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
                link.style.color = "var(--brand-primary)";
            }
        });
    });
});

// FAQ Filtering Logic
function filterFaq(category, btnElement) {
    const buttons = document.querySelectorAll('.faq-tab');
    buttons.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const categories = document.querySelectorAll('.faq-category');
    
    categories.forEach(cat => {
        if (cat.getAttribute('data-category') === category) {
            cat.classList.remove('hidden');
            cat.classList.add('active-category');
        } else {
            cat.classList.add('hidden');
            cat.classList.remove('active-category');
        }
    });
}

// --- IMPROVED FORM SUBMISSION SCRIPT ---
const form = document.getElementById('contact-form');
const button = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');
const errorMsg = document.getElementById('form-error');

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // --- VALIDATION LOGIC ---
    const packageSelect = document.getElementById('package-select');
    
    // Check if Enterprise is selected
    if (packageSelect.value === 'Enterprise') {
        const shortVal = parseInt(document.getElementById('contact-short').value) || 0;
        const longVal = parseInt(document.getElementById('contact-long').value) || 0;

        // Validate minimums: 6 short, 2 long
        if (shortVal < 6 || longVal < 2) {
            alert("For Enterprise packages, a minimum of 6 Short Form and 2 Long Form videos is required.");
            return;
        }
    }
    // --- END VALIDATION LOGIC ---

    // Sync hidden inputs one last time before send
    // Ensure calculation is fresh
    calculateContactFormPrice(); 

    // UI Feedback state
    const originalText = button.innerText;
    button.innerText = "Sending...";
    button.disabled = true;
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    const formData = new FormData(form);

    // Add subject dynamically based on name
    const clientName = document.getElementById('name').value || "Client";
    // Web3Forms uses 'subject' field, handled by hidden input, but appending for custom title
    // formData.append('subject', `New Lead: ${clientName} - Novexy Studios`); 

    try {
        // We use AbortController to set a timeout on the fetch request
        // If formsubmit.co takes longer than 10 seconds, we show an error instead of hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json' 
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        // Parse JSON response from Web3Forms
        const json = await response.json();

        if (response.status == 200) {
            // Success
            successMsg.style.display = 'block';
            form.reset(); 
            document.getElementById('contact-custom-fields').classList.add('hidden');
            
            // Reset hidden counts/prices to Starter default
            calculateContactFormPrice();

            button.innerText = "Sent Successfully";
            setTimeout(() => {
                button.innerText = originalText;
                button.disabled = false;
            }, 5000);
        } else {
            // Server returned an error (e.g. 500 or 400)
            console.log(response);
            throw new Error(json.message || 'Server responded with error');
        }

    } catch (error) {
        console.error('Submission Error:', error);
        
        // Show Error Message
        errorMsg.style.display = 'block';
        // Display specific error message if available
        errorMsg.innerText = error.message || "Something went wrong. Please try again later.";
        
        button.innerText = "Error. Try Again";
        
        setTimeout(() => {
            button.innerText = originalText;
            button.disabled = false;
        }, 3000);
    }
});

// --- NEW: Calculate Price Function for CONTACT FORM ---
function calculateContactFormPrice() {
    const select = document.getElementById('package-select');
    
    // Input Elements
    const customShortInput = document.getElementById('contact-short');
    const customLongInput = document.getElementById('contact-long');
    const tierSelect = document.getElementById('contact-tier');
    
    // Hidden Output Fields
    const shortHidden = document.getElementById('final-short-count');
    const longHidden = document.getElementById('final-long-count');
    const tierHidden = document.getElementById('form-tier-hidden');
    const priceHidden = document.getElementById('form-price-hidden');
    const displaySpan = document.getElementById('contact-price-display');

    // Custom Field Container
    const customFields = document.getElementById('contact-custom-fields');

    let shortCount = "0";
    let longCount = "0";
    let estimatedPrice = 0;
    let tierName = "Standard Package (Included)";

    // Show/Hide Logic
    if (select.value === 'Enterprise') {
        customFields.classList.remove('hidden');
    } else {
        customFields.classList.add('hidden');
    }

    // Calculation Logic
    if (select.value === 'Starter') {
        shortCount = "5";
        longCount = "2";
        estimatedPrice = 30000;
        tierName = "Standard Package";
    } else if (select.value === 'Growth') {
        shortCount = "12";
        longCount = "4";
        estimatedPrice = 60000;
        tierName = "Standard Package";
    } else if (select.value === 'Pro Scale') {
        shortCount = "20";
        longCount = "5";
        estimatedPrice = 100000;
        tierName = "Standard Package";
    } else if (select.value === 'Enterprise') {
        // Get values from custom inputs
        let s = parseInt(customShortInput.value) || 0;
        let l = parseInt(customLongInput.value) || 0;
        let t = parseInt(tierSelect.value);

        shortCount = s.toString();
        longCount = l.toString();

        // Base Calc: (Short * 3000) + (Long * 6000)
        let basePrice = (s * 3000) + (l * 6000);
        
        // Tier Multiplier
        let multiplier = 1;
        if (t === 2) multiplier = 1.15;
        if (t === 3) multiplier = 1.30;

        estimatedPrice = basePrice * multiplier;

        // Set Tier Name text
        if (t === 1) tierName = "Tier 1: Standard";
        if (t === 2) tierName = "Tier 2: Engagement";
        if (t === 3) tierName = "Tier 3: High-Motion";
    }

    // Update Hidden Inputs
    shortHidden.value = shortCount;
    longHidden.value = longCount;
    priceHidden.value = "₹" + Math.floor(estimatedPrice).toLocaleString('en-IN');
    tierHidden.value = tierName;

    // Update Visible Display (if element exists)
    if (displaySpan) {
        displaySpan.innerText = "₹" + Math.floor(estimatedPrice).toLocaleString('en-IN');
    }
}

// Add listeners for custom inputs to update hidden fields in real-time
document.addEventListener('DOMContentLoaded', () => {
     const shortInput = document.getElementById('contact-short');
     const longInput = document.getElementById('contact-long');
     if (shortInput) shortInput.addEventListener('input', calculateContactFormPrice);
     if (longInput) longInput.addEventListener('input', calculateContactFormPrice);
     
     // Initialize hidden fields with default values (Starter)
     calculateContactFormPrice();
});


// --- NEW: PRICING POPUP LOGIC ---

// Data Object for Packages based on PDF
const packageData = {
    'starter': {
        name: 'Starter (Small Popcorn)',
        desc: 'Includes 5 Short Form & 2 Long Form Videos (1-10 min).',
        basePrice: 30000,
        longCount: 2,
        shortCount: 5,
        totalCount: 7,
        revisions: 2,
        longRatio: '30%',
        shortRatio: '70%'
    },
    'growth': {
        name: 'Growth (Medium Popcorn)',
        desc: 'Includes 12 Short Form & 4 Long Form Videos.',
        basePrice: 60000,
        longCount: 4,
        shortCount: 12,
        totalCount: 16,
        revisions: 'Unlimited',
        longRatio: '25%',
        shortRatio: '75%'
    },
    'pro': {
        name: 'Pro Scale (Large Popcorn)',
        desc: 'Best Seller! 20 Short Form & 5 Long Form Videos.',
        basePrice: 100000,
        longCount: 5,
        shortCount: 20,
        totalCount: 25,
        revisions: 'Unlimited',
        longRatio: '20%',
        shortRatio: '80%'
    },
    'enterprise': {
        name: 'Enterprise (Custom)',
        desc: 'Configure your own package. Select the number of videos below.',
        basePrice: 0, // Calculated dynamically
        longCount: 0,
        shortCount: 0,
        totalCount: 0,
        revisions: 'Unlimited',
        longRatio: '50%',
        shortRatio: '50%'
    }
};

let currentPackageKey = 'starter';
let currentTier = 1;
let lockedInfoType = null; // Track if user has clicked to lock info

// Prices for custom package
const PRICE_SHORT = 3000;
const PRICE_LONG = 6000;

// Open Modal Function
function openPricingModal(pkgKey) {
    currentPackageKey = pkgKey;
    lockedInfoType = null; // Reset lock on open
    const data = packageData[pkgKey];
    
    // Populate Modal Left Side
    document.getElementById('modal-package-name').innerText = 'Package: ' + data.name;
    document.getElementById('modal-package-desc').innerText = data.desc;
    document.getElementById('modal-long-count').innerText = data.longCount;
    document.getElementById('modal-short-count').innerText = data.shortCount;
    document.getElementById('modal-total-count').innerText = data.totalCount;
    document.getElementById('modal-revision-count').innerText = data.revisions;
    
    // Toggle Custom Inputs
    const customConfig = document.getElementById('custom-config-section');
    if (pkgKey === 'enterprise') {
        customConfig.classList.remove('hidden');
        // Set default values for custom (e.g., 6 for short, 2 for long)
        document.getElementById('custom-short-input').value = 6;
        document.getElementById('custom-long-input').value = 2; // Default to 2
        calculateCustomPrice(); // Initial calc
    } else {
        customConfig.classList.add('hidden');
        // Update Visual Bars for standard packages
        document.getElementById('bar-long-visual').style.width = data.longRatio;
        document.getElementById('bar-short-visual').style.width = data.shortRatio;
    }

    // Reset Tier Selection
    document.getElementById('tier-select').value = "1";
    currentTier = 1;
    
    // If standard package, update tier immediately. If custom, calc handles it.
    if (pkgKey !== 'enterprise') {
        updateTierPrice();
    }

    // Show Modal
    document.getElementById('pricing-modal').classList.add('active');
}

// Calculate Custom Price based on Inputs
function calculateCustomPrice() {
    if (currentPackageKey !== 'enterprise') return;

    const shortQty = parseInt(document.getElementById('custom-short-input').value) || 0;
    const longQty = parseInt(document.getElementById('custom-long-input').value) || 0;
    
    // Update Counts in Left Panel
    document.getElementById('modal-short-count').innerText = shortQty;
    document.getElementById('modal-long-count').innerText = longQty;
    const totalQty = shortQty + longQty;
    document.getElementById('modal-total-count').innerText = totalQty;

    // Visual Bars Logic
    if (totalQty > 0) {
        const longPct = (longQty / totalQty) * 100;
        const shortPct = (shortQty / totalQty) * 100;
        document.getElementById('bar-long-visual').style.width = longPct + '%';
        document.getElementById('bar-short-visual').style.width = shortPct + '%';
        document.getElementById('custom-error').style.display = 'none';
    } else {
        document.getElementById('bar-long-visual').style.width = '50%';
        document.getElementById('bar-short-visual').style.width = '50%';
    }

    // Calculate Base Price
    let basePrice = (shortQty * PRICE_SHORT) + (longQty * PRICE_LONG);
    
    // Apply Tier Multiplier
    let multiplier = 1;
    currentTier = parseInt(document.getElementById('tier-select').value);
    if (currentTier === 2) multiplier = 1.15;
    if (currentTier === 3) multiplier = 1.30;

    let finalPrice = basePrice * multiplier;

    // Update Display
    document.getElementById('modal-price-display').innerText = '₹' + Math.floor(finalPrice).toLocaleString('en-IN');
    
    // Update Tier Description Text
    updateTierDescriptionText();
}

// Close Modal Function
function closePricingModal() {
    document.getElementById('pricing-modal').classList.remove('active');
    // Ensure reset when closing
    lockedInfoType = null;
    hideInfo();
}

// Close on clicking outside
document.getElementById('pricing-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePricingModal();
    }
});

// Update Price based on Tier (Handles both Standard and Custom)
function updateTierPrice() {
    currentTier = parseInt(document.getElementById('tier-select').value);
    
    if (currentPackageKey === 'enterprise') {
        calculateCustomPrice(); // Recalculate based on inputs + new tier
        return;
    }

    const base = packageData[currentPackageKey].basePrice;
    let finalPrice = base;

    if (currentTier === 1) {
        finalPrice = base;
    } else if (currentTier === 2) {
        finalPrice = base + (base * 0.15); // +15%
    } else if (currentTier === 3) {
        finalPrice = base + (base * 0.30); // +30%
    }

    // Format Price with Comma and Rupee Symbol
    document.getElementById('modal-price-display').innerText = '₹' + finalPrice.toLocaleString('en-IN');
    
    updateTierDescriptionText();
}

// Separate function just for text description to avoid duplication
function updateTierDescriptionText() {
        let description = "";
        if (currentTier === 1) {
        description = `
            <strong style="color: white; display:block; margin-bottom:5px;">Tier 1: Standard (Included in Price)</strong>
            <ul style="list-style-type: disc; padding-left: 20px; color: #ccc;">
                <li><strong style="color: var(--brand-primary)">Visual Polish:</strong> Professional Color Grading & Standard Cuts/Transitions.</li>
                <li><strong style="color: var(--brand-primary)">Audio Engineering:</strong> Sound Design, noise reduction & mixing.</li>
                <li><strong style="color: var(--brand-primary)">Key Elements:</strong> Simple Motion Graphics, Overlays, and Masking.</li>
                <li><strong style="color: var(--brand-primary)">Accessibility:</strong> Clean, readable Standard Subtitles.</li>
            </ul>
        `;
        } else if (currentTier === 2) {
        description = `
            <strong style="color: white; display:block; margin-bottom:5px;">Tier 2: Engagement (+15% Upgrade)</strong>
            <ul style="list-style-type: disc; padding-left: 20px; color: #ccc;">
                <li style="font-style:italic; color:var(--brand-primary); margin-bottom:4px;">Includes Tier 1</li>
                <li><strong style="color: var(--brand-primary)">Dynamic Captions:</strong> Viral animated subtitles with keyword highlighting.</li>
                <li><strong style="color: var(--brand-primary)">Visual Variety:</strong> Premium Illustrations overlays and Stock Footage.</li>
                <li><strong style="color: var(--brand-primary)">Pacing Control:</strong> Strategic Zoom-ins/outs (J-cuts/L-cuts) to keep the energy high.</li>
                <li><strong style="color: var(--brand-primary)">Engagement Hooks:</strong> Visual elements that encourage viewers to like, share, or comment on the video.</li>
            </ul>
        `;
        } else if (currentTier === 3) {
        description = `
            <strong style="color: white; display:block; margin-bottom:5px;">Tier 3: High-Motion (+30% Upgrade)</strong>
            <ul style="list-style-type: disc; padding-left: 20px; color: #ccc;">
                <li style="font-style:italic; color:var(--brand-primary); margin-bottom:4px;">Includes Tier 2</li>
                <li><strong style="color: var(--brand-primary)">Custom Animation:</strong> Bespoke Motion Graphics & Kinetic Typography (3D Text).</li>
                <li><strong style="color: var(--brand-primary)">Storytelling Elements:</strong> Paper-tear effects, map animations, and custom soundscapes.</li>
                <li><strong style="color: var(--brand-primary)">Seamless Flow:</strong> Complex transitions that blend scenes invisibly.</li>
                <li><strong style="color: var(--brand-primary)">2.5D Parallax Effect:</strong> We turn your static photos into moving 3D scenes.</li>
                <li><strong style="color: var(--brand-primary)">Object Tracking:</strong> Text or graphics that "stick" to moving objects in the video.</li>
            </ul>
        `;
        }
        document.getElementById('tier-description').innerHTML = description;
}

// UPDATED: Toggle Info logic with Click Support for Enterprise
function handleInfoClick(type) {
    // Only proceed if current package is Enterprise
    if (currentPackageKey !== 'enterprise') return;

    // If the same type is clicked, close it (toggle behavior)
    if (lockedInfoType === type) {
        lockedInfoType = null;
        const panel = document.getElementById('info-panel');
        panel.classList.remove('visible');
    } else {
        // Otherwise open the new type
        lockedInfoType = type;
        showInfo(type, false); // isHover = false, because this is a click
    }
}

// Toggle Info (Original Click to Lock - mostly for standard packages now if needed)
function toggleInfo(type) {
    if (lockedInfoType === type) {
        // Clicked same item: Unlock
        lockedInfoType = null;
        // Don't hide immediately, let mouseleave handle it naturally
    } else {
        // Clicked new item: Lock and Show
        lockedInfoType = type;
        showInfo(type);
    }
}

// Hover Info Logic (Populated from Turnaround PDF)
function showInfo(type, isHover = false) {
    // UPDATED: Disable hover effect for Enterprise package
    if (currentPackageKey === 'enterprise' && isHover) {
        return;
    }

    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');
    
    let html = '';

    if (type === 'long') {
        html = `
            <h4 style="color:var(--brand-primary); margin-bottom:10px;">Long Form Turnaround</h4>
            <table class="info-table">
                <tr><th>Duration</th><th>Turnaround</th><th>Rush Fee</th></tr>
                <tr><td>3-10 min</td><td>2-3 days</td><td>+30-40%</td></tr>
                <tr><td>10-15 min</td><td>3-4 days</td><td>+30-40%</td></tr>
                <tr><td>15-20 min</td><td>4-5 days</td><td>+30-40%</td></tr>
            </table>
        `;
    } else if (type === 'short') {
        html = `
            <h4 style="color:var(--brand-primary); margin-bottom:10px;">Short Form Turnaround</h4>
            <table class="info-table">
                <tr><th>Duration</th><th>Standard</th><th>Rush (24h)</th></tr>
                <tr><td>15-60 sec</td><td>24-48 hr</td><td>+20% fee</td></tr>
            </table>
            <p style="font-size:0.85rem; color:#aaa; margin-top:10px;">*Time starts after full footage & brief received.</p>
        `;
    } else if (type === 'revision') {
        html = `
            <h4 style="color:var(--brand-primary); margin-bottom:10px;">Revision Policy</h4>
            <p style="font-size:0.9rem; color:#ccc; line-height:1.5;">
                Revisions may extend final delivery time by 24-48 hours depending on scope.
                <br><br>
                <strong>Queue Policy:</strong> Multiple videos submitted simultaneously will be queued and prioritized by submission time.
            </p>
        `;
    }

    content.innerHTML = html;
    
    // SHOW INFO with class (triggers CSS transition)
    panel.classList.add('visible');
}

function hideInfo(isHover = false) {
    // UPDATED: Prevent hiding on mouseleave if it's Enterprise (handled by click now)
    if (currentPackageKey === 'enterprise' && isHover) {
        return;
    }

    const panel = document.getElementById('info-panel');
    
    // If user has locked a specific info (via click), show that instead of hiding
    // But for Enterprise, the toggle logic handles this, so this check is mainly for standard packages
    if (lockedInfoType && currentPackageKey !== 'enterprise') {
        showInfo(lockedInfoType);
    } else if (currentPackageKey !== 'enterprise') { 
        // Only auto-hide on hover-out for non-enterprise packages
        // HIDE INFO (triggers CSS transition back to 0 height)
        panel.classList.remove('visible');
    }
}

// Contact Custom Fields Toggle
function toggleContactCustomFields() {
    const select = document.getElementById('package-select');
    const fields = document.getElementById('contact-custom-fields');
    if (select.value === 'Enterprise') {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}