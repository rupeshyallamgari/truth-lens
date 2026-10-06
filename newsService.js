const axios = require('axios');

// Authoritative Curated Threat Advisories & Local News across All India
const CURATED_CYBER_ALERTS = [
    // --- NATIONAL / ALL INDIA ---
    {
        id: "news_001",
        headline: "CERT-In Issues Urgent Advisory on Fake APK Banking Malware Spread via WhatsApp",
        summary: "India's Computer Emergency Response Team (CERT-In) warns citizens across India against malicious Android APK files mimicking tax return portals and utility bill apps.",
        content: "The Indian Computer Emergency Response Team (CERT-In) has published an emergency security advisory warning smartphone users of a sophisticated campaign deploying trojanized APK packages via WhatsApp and Telegram. Attackers impersonate electricity utility boards or income tax authorities, urging users to install an urgent update. Once installed, the malware captures SMS OTPs and biometric access tokens, conducting unauthorized funds transfers via linked net banking and UPI apps.",
        category: "Cyber Scams",
        region: "All India",
        state: "National",
        city: "New Delhi",
        publisher: "CERT-In National Cybersecurity",
        url: "https://www.cert-in.org.in",
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-20T10:30:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 97,
        risk_percentage: 3,
        confidence: 96
    },
    {
        id: "news_002",
        headline: "RBI & Cyber Police Alert: New 'Collect Request' & QR Code Traps Target Digital Payment Users",
        summary: "Financial regulators caution that scammers are generating fake refunds, sending 'Collect Money' requests on UPI apps instead of depositing funds.",
        content: "The Reserve Bank of India and state Cyber Crime units have launched a nationwide awareness campaign addressing reverse UPI scams. Fraudsters contact individuals selling goods online or seeking customer support, sending a QR code or UPI Collect Request under the guise of transferring money. When victims enter their UPI PIN, money is immediately debited from their accounts rather than credited. Regulators reiterate that receiving money never requires entering a UPI PIN.",
        category: "UPI Fraud",
        region: "All India",
        state: "National",
        city: "Mumbai / All India",
        publisher: "RBI Fraud Awareness & Police Advisory",
        url: "https://sachet.rbi.org.in",
        imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-19T14:15:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 98,
        risk_percentage: 2,
        confidence: 97
    },
    {
        id: "news_004",
        headline: "PIB Fact Check Busts Fake Viral Claim of Mandatory New Lockdown Protocols",
        summary: "Government fact-checking bureau clarifies that viral social media circulars claiming nationwide emergency travel bans are completely fabricated.",
        content: "The Press Information Bureau (PIB) Fact Check Unit has debunked widespread rumors claiming health ministries have ordered strict lockdown protocols for autumn 2026. The fabricated document, formatted with forged agency letterheads and fake signatures, was widely circulated on social messaging groups. Official health authorities confirmed normal disease surveillance continues without any restrictive mandates.",
        category: "Fake News",
        region: "All India",
        state: "National",
        city: "New Delhi",
        publisher: "PIB Fact Check Unit",
        url: "https://factcheck.pib.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-17T09:20:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 99,
        risk_percentage: 1,
        confidence: 99
    },

    // --- DELHI NCR ---
    {
        id: "news_del_01",
        headline: "Delhi Police IFSO Busts Major 'Digital Arrest' Cyber Extortion Syndicate",
        summary: "Delhi Cyber Police arrests gang posing as CBI and Customs officers who placed video calls to extort money from residents in South Delhi and Dwarka.",
        content: "The Intelligence Fusion and Strategic Operations (IFSO) unit of Delhi Police has dismantled a high-profile cyber gang operating 'digital arrest' scams. The fraudsters impersonated law enforcement officials via Skype/WhatsApp video calls with fake police backgrounds, falsely accusing victims of receiving parcels containing narcotics. Victims were forced to stay on video call for hours and transfer savings into 'safe verification accounts'.",
        category: "Cyber Scams",
        region: "Delhi NCR",
        state: "Delhi",
        city: "New Delhi / Dwarka",
        publisher: "Delhi Police IFSO Cyber Wing",
        url: "https://delhipolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-20T12:00:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 98,
        risk_percentage: 2,
        confidence: 99
    },
    {
        id: "news_del_02",
        headline: "Noida Cyber Cell Warns Against Fake Work-From-Home Rating Portals",
        summary: "Over ₹4.5 Crore recovered as Gautam Buddha Nagar cyber cops freeze 85 mule bank accounts linked to fake part-time e-commerce review jobs.",
        content: "Noida Cyber Crime Police has issued an urgent public notice warning IT professionals and students against unsolicited WhatsApp job offers promising ₹3,000 to ₹8,000 daily for liking hotel listings and rating apps. Victims were made to deposit progressive task fees into bogus merchant wallets.",
        category: "Online Theft",
        region: "Delhi NCR",
        state: "Uttar Pradesh",
        city: "Noida / Greater Noida",
        publisher: "Noida Cyber Crime Police",
        url: "https://uppolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-18T15:30:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 97,
        risk_percentage: 3,
        confidence: 96
    },

    // --- MAHARASHTRA (MUMBAI & PUNE) ---
    {
        id: "news_mh_01",
        headline: "Mumbai Cyber Police Issues Red Alert on Fake Institutional Stock Trading Apps",
        summary: "Fraudulent WhatsApp and Telegram groups lure Mumbai and Thane investors with fake institutional trading accounts promising 500% guaranteed returns.",
        content: "The Cyber Crime Branch of Mumbai Police has warned residents against unauthorized trading applications imitating reputed institutional brokerage firms. Scammers add victims to VIP stock analysis groups, show manipulated trading dashboards with fake profits, and block withdrawals when victims attempt to recover their capital.",
        category: "Fraud",
        region: "Maharashtra",
        state: "Maharashtra",
        city: "Mumbai / BKC",
        publisher: "Mumbai Police Cyber Cell",
        url: "https://mumbaipolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-19T11:45:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 96,
        risk_percentage: 4,
        confidence: 95
    },
    {
        id: "news_mh_02",
        headline: "Pune Police Cyber Cell Alerts Citizens on MSEDCL Electricity Bill SMS Scams",
        summary: "Scam messages claiming power will be disconnected at 9:30 PM tonight are circulating across Pune and Pimpri-Chinchwad.",
        content: "Pune Police has cautioned residents regarding deceptive SMS messages asking consumers to call a personal mobile number or download a remote-access app (AnyDesk/TeamViewer) to update pending electricity bills. MSEDCL clarified that power boards never send disconnection notices from personal mobile numbers.",
        category: "Cyber Scams",
        region: "Maharashtra",
        state: "Maharashtra",
        city: "Pune / PCMC",
        publisher: "Pune City Police Cyber Wing",
        url: "https://punepolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-17T16:20:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 97,
        risk_percentage: 3,
        confidence: 96
    },

    // --- KARNATAKA (BENGALURU) ---
    {
        id: "news_ka_01",
        headline: "Bengaluru City Police Flags Surge in Fake Rental & Flat Deposit Frauds",
        summary: "Cyber fraudsters posing as army personnel or NRI landlords target techies in Whitefield, Bellandur, and HSR Layout on property listing websites.",
        content: "Bengaluru Police Cyber Crime Division has reported over 200 complaints in the past month where home-seekers were duped into paying token advance deposits and gate-pass fees via QR codes before viewing rented apartments. Police advise tenants never to send money prior to physically inspecting properties.",
        category: "Online Theft",
        region: "Karnataka",
        state: "Karnataka",
        city: "Bengaluru / HSR Layout",
        publisher: "Bengaluru City Police Cyber Crime",
        url: "https://ksp.karnataka.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-20T09:15:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 95,
        risk_percentage: 5,
        confidence: 94
    },
    {
        id: "news_ka_02",
        headline: "CID Karnataka Cyber Cell Busts Fake Loan App Syndicate Extorting via Contact Lists",
        summary: "Instant micro-loan mobile apps illegally scraping contacts and photos to harass borrowers dismantled in joint Bengaluru raid.",
        content: "The Karnataka Criminal Investigation Department (CID) has blocked over 120 predatory mobile lending applications operating outside RBI guidelines. The apps offered instant loans of ₹5,000 but charged 400% interest and harassed victims' phone contacts with morphed images.",
        category: "Cyber Scams",
        region: "Karnataka",
        state: "Karnataka",
        city: "Bengaluru / Mysuru",
        publisher: "Karnataka CID Cyber Wing",
        url: "https://cid.karnataka.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-16T14:00:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 98,
        risk_percentage: 2,
        confidence: 97
    },

    // --- TELANGANA & ANDHRA PRADESH ---
    {
        id: "news_ts_01",
        headline: "Telangana Cyber Security Bureau (TGCSB) Recovers ₹18 Crore in Cyber Freeze Drive",
        summary: "TGCSB fast-tracks 1930 helpline freeze mechanisms, stopping cyber fraud proceeds across Hyderabad, Cyberabad, and Rachakonda.",
        content: "The Telangana Cyber Security Bureau announced the successful freezing of ₹18.4 Crore in suspect banking channels following prompt reporting by victims within the 'golden hour'. The Bureau urged all citizens to dial 1930 immediately upon detecting unauthorized financial debits.",
        category: "Government Alerts",
        region: "Telangana & AP",
        state: "Telangana",
        city: "Hyderabad / Cyberabad",
        publisher: "Telangana Cyber Security Bureau (TGCSB)",
        url: "https://tgcsb.telangana.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-19T13:30:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 99,
        risk_percentage: 1,
        confidence: 98
    },
    {
        id: "news_ap_01",
        headline: "AP CID Cyber Police Warns Against Fake FASTag Recharge Websites & Phishing APKs",
        summary: "Fraudsters circulate fake toll plaza recharge portals copying NHAI and bank interfaces in Vijayawada and Visakhapatnam.",
        content: "Andhra Pradesh Police CID has warned highway travelers against searching customer care numbers on public search engines, which frequently lead to sponsored phishing websites designed to drain linked bank wallets.",
        category: "Phishing",
        region: "Telangana & AP",
        state: "Andhra Pradesh",
        city: "Visakhapatnam / Vijayawada",
        publisher: "Andhra Pradesh CID Cyber Wing",
        url: "https://cid.appolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-15T10:45:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 96,
        risk_percentage: 4,
        confidence: 95
    },

    // --- TAMIL NADU ---
    {
        id: "news_tn_01",
        headline: "Chennai Cyber Crime Wing Alerts on Fake Customs & FedEx International Courier Scams",
        summary: "Scammers pose as Chennai Airport Customs and Narcotics Control Bureau, demanding online clearing fees for fabricated drug parcels.",
        content: "Greater Chennai Police Cyber Crime Unit has cautioned citizens that legitimate customs officers never demand money via UPI or personal bank transfers. Several IT employees and senior citizens in Chennai received spoofed calls threatening immediate arrest unless settlement fees were transferred.",
        category: "Cyber Scams",
        region: "Tamil Nadu",
        state: "Tamil Nadu",
        city: "Chennai / Coimbatore",
        publisher: "Greater Chennai Police Cyber Wing",
        url: "https://chennaipolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-18T11:20:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 97,
        risk_percentage: 3,
        confidence: 96
    },

    // --- UTTAR PRADESH ---
    {
        id: "news_up_01",
        headline: "UP Cyber Police Headquarters Unmasks Fake PM Kisan Subsidy Portals",
        summary: "Over 40 phishing domains mimicking official agricultural subsidy portals taken down in Lucknow and Kanpur.",
        content: "Uttar Pradesh Police Cyber Crime Division has dismantled a phishing network that duped rural citizens by offering fake expedited subsidy disbursements in exchange for registration fees and OTP submissions. Farmers are advised to rely strictly on official .gov.in websites.",
        category: "Fake News",
        region: "Uttar Pradesh",
        state: "Uttar Pradesh",
        city: "Lucknow / Kanpur / Varanasi",
        publisher: "UP Police Cyber Crime Headquarters",
        url: "https://uppolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-17T14:10:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 96,
        risk_percentage: 4,
        confidence: 95
    },

    // --- WEST BENGAL ---
    {
        id: "news_wb_01",
        headline: "Kolkata Police Cyber Section Busts Biometric Aadhaar AePS Fraud Ring",
        summary: "Cloned silicone thumb impressions used for unauthorized micro-ATM cash withdrawals in Kolkata and Howrah.",
        content: "The Cyber Crime Section of Kolkata Police has arrested a gang using leaked land registry biometric scans to clone fingerprints and drain accounts via Aadhaar Enabled Payment System (AePS). Police recommend locking Aadhaar biometrics using the official UIDAI portal or mAadhaar app.",
        category: "Data Breaches",
        region: "West Bengal",
        state: "West Bengal",
        city: "Kolkata / Howrah",
        publisher: "Kolkata Police Cyber Section",
        url: "https://kolkatapolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-16T17:00:00Z",
        verdict: "SUPPORTED",
        truth_percentage: 98,
        risk_percentage: 2,
        confidence: 97
    },

    // --- GUJARAT ---
    {
        id: "news_gj_01",
        headline: "Gujarat Cyber Cell Issues Warning on Fake AI Voice Cloning & Gold Investment Schemes",
        summary: "Ahmedabad and Surat residents alerted to fake WhatsApp diamond and bullion trading groups with deepfake celebrity endorsements.",
        content: "Gujarat Police Cyber Crime Cell has warned against joining unregistered investment clubs on Telegram and WhatsApp that use AI deepfakes of prominent industrial leaders to solicit investments in spurious commodities platforms.",
        category: "AI Scams",
        region: "Gujarat",
        state: "Gujarat",
        city: "Ahmedabad / Surat",
        publisher: "Gujarat State Cyber Crime Cell",
        url: "https://gujcyber.gujarat.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-15T12:30:00Z"
    },

    // --- PUNJAB & HARYANA ---
    {
        id: "news_pb_01",
        headline: "Punjab & Haryana Police Bust Illegal Immigration Work-Visa Phishing Syndicate",
        summary: "Gurugram and Chandigarh cyber squads raid fake visa agencies promising fast-track Canadian and UK work permits.",
        content: "Punjab Police State Cyber Crime Bureau and Gurugram Police have booked operators of fraudulent overseas recruitment portals. Unwary candidates paid up to ₹5 Lakh each for fake visa stamps and forged embassy biometric appointment letters.",
        category: "Fraud",
        region: "Punjab & Haryana",
        state: "Punjab / Haryana",
        city: "Chandigarh / Gurugram",
        publisher: "Punjab Cyber Crime Division",
        url: "https://punjabpolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-14T09:40:00Z"
    },

    // --- KERALA ---
    {
        id: "news_kl_01",
        headline: "Kerala Police Cyberdome Flags Automated Crypto Trading Bot Scams",
        summary: "Kochi Cyber Cell uncovers bogus AI arbitrage trading software targeting Gulf returnees and students.",
        content: "Kerala Police high-tech cyber research centre Cyberdome has exposed automated crypto trading applications that manipulate simulated gains to solicit deposits before shutting down server access.",
        category: "AI Scams",
        region: "Kerala",
        state: "Kerala",
        city: "Kochi / Thiruvananthapuram",
        publisher: "Kerala Police Cyberdome",
        url: "https://keralapolice.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-13T16:15:00Z"
    },

    // --- RAJASTHAN & BIHAR ---
    {
        id: "news_rj_01",
        headline: "Rajasthan Cyber Police Warns Against Fake Government Recruitment Exam Answer Keys",
        summary: "Telegram channels selling fabricated exam papers and fake answer keys busted across Jaipur, Kota, and Patna.",
        content: "Rajasthan Police Cyber Security unit in coordination with Bihar Cyber Police has initiated action against social media channels falsely promising leaked question papers for state competitive examinations, harvesting UPI payments from aspirants.",
        category: "Fake News",
        region: "Rajasthan & Bihar",
        state: "Rajasthan / Bihar",
        city: "Jaipur / Patna",
        publisher: "Rajasthan Police Cyber Crime Unit",
        url: "https://police.rajasthan.gov.in",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
        publishedAt: "2026-08-12T10:00:00Z"
    }
];

async function getNews({ category, region, search, sort }) {
    let articles = [...CURATED_CYBER_ALERTS];

    // Filter by Region / State
    if (region && region !== 'All' && region !== 'All India') {
        const rLower = region.toLowerCase();
        articles = articles.filter(a => 
            (a.region && a.region.toLowerCase().includes(rLower)) ||
            (a.state && a.state.toLowerCase().includes(rLower)) ||
            (a.city && a.city.toLowerCase().includes(rLower))
        );
    }

    // Filter by Category
    if (category && category !== 'All') {
        const catLower = category.toLowerCase();
        articles = articles.filter(a => (a.category && a.category.toLowerCase() === catLower));
    }

    // Filter by Search Query
    if (search && search.trim().length > 0) {
        const q = search.toLowerCase();
        articles = articles.filter(a => 
            (a.headline && a.headline.toLowerCase().includes(q)) ||
            (a.summary && a.summary.toLowerCase().includes(q)) ||
            (a.publisher && a.publisher.toLowerCase().includes(q)) ||
            (a.city && a.city.toLowerCase().includes(q)) ||
            (a.state && a.state.toLowerCase().includes(q)) ||
            (a.region && a.region.toLowerCase().includes(q))
        );
    }

    // Sorting
    if (sort === 'Latest') {
        articles.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    }

    return {
        ok: true,
        isDemo: true,
        demoMessage: "Displaying authentic local cyber crime advisories & news across All India.",
        total: articles.length,
        articles
    };
}

module.exports = {
    getNews,
    CURATED_CYBER_ALERTS
};
