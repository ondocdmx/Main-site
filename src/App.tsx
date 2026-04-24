import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, X, ChevronRight, Menu, Plus, Minus, Trash2, MapPin, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { client, writeClient, urlFor } from './sanityClient';

const t = {
  es: {
    banner: "APAPÁCHATE | ENVÍO GRATIS EN 12+ CARTONES",
    midBanner: "¡Aprovecha un regalo con tu primer pedido usando código: ONDOFIRST!",
    navShop: "TIENDA",
    navSubs: "SUSCRIPCIÓN",
    navSteps: "CÓMO FUNCIONA",
    navAbout: "NOSOTROS",
    emptyCart: "Tu carrito está vacío",
    subtotal: "Subtotal",
    checkout: "Ir a pagar",
    heroTitle: "FIRST WE SOUP",
    heroSub: "Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.",
    shopNow: "¡APAPÁCHATE!",
    filtersTitle: "Filtros",
    filterBundle: "Vegetariano",
    filterNew: "Frío",
    filterBestseller: "Caliente",
    filterVegan: "Vegano",
    sortBy: "Ordenar por",
    addToCart: "Agregar al Carrito",
    splitTitle: "SIPS AND SIMMERS,\nSHIPPED.",
    splitSub: "Sin compromiso • Nunca te quedes sin stock",
    subscribeSave: "SUSCRÍBETE Y AHORRA",
    offLife: "20% de descuento de por vida",
    stepsTitle: "La cena es así de fácil",
    step1Title: "1. Elige tus sopas",
    step1Desc: "Navega y elige de nuestras recetas curadas desde nuestra tienda.",
    step2Title: "2. Recibe fresco",
    step2Desc: "Ingredientes frescos entregados en la puerta de tu casa.",
    step3Title: "3. Disfruta con confianza",
    step3Desc: "Sigue simples instrucciones y disfruta deliciosos platillos caseros sin estrés.",
    aboutTitle: "Nutrición para un\nmundo acelerado.",
    aboutSub: "In soup we trust. Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.",
    bestSellersTitle: "CALDOS MÁS VENDIDOS",
    shopBestSellers: "COMPRA LOS MÁS VENDIDOS",
    reviews: "Reseñas",
    subscribeTab: "Suscripción",
    singleTab: "Una sola compra"
  },
  en: {
    banner: "APAPÁCHATE | FREE SHIPPING 12+ CARTONS",
    midBanner: "Get a free gift with your first order using code: ONDOFIRST!",
    navShop: "SHOP",
    navSubs: "SUBSCRIPTION",
    navSteps: "HOW IT WORKS",
    navAbout: "ABOUT",
    emptyCart: "Your cart is empty",
    subtotal: "Subtotal",
    checkout: "Go to checkout",
    heroTitle: "FIRST WE SOUP",
    heroSub: "Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.",
    shopNow: "¡APAPÁCHATE!",
    filtersTitle: "Filters",
    filterBundle: "Vegetarian",
    filterNew: "Cold",
    filterBestseller: "Hot",
    filterVegan: "Vegan",
    sortBy: "Sort by",
    addToCart: "Add to Cart",
    splitTitle: "SIPS AND SIMMERS,\nSHIPPED.",
    splitSub: "No Commitment • Never Run Out",
    subscribeSave: "SUBSCRIBE & SAVE",
    offLife: "20% Off for Life",
    stepsTitle: "Dinner's easy as 1, 2, 3",
    step1Title: "1. Pick your meals",
    step1Desc: "Browse and choose from our chef-curated recipes from our shop each week.",
    step2Title: "2. Ingredients arrive fresh",
    step2Desc: "Fresh, portioned ingredients are delivered right to your door in a convenient box.",
    step3Title: "3. Cook with confidence",
    step3Desc: "Follow simple instructions and enjoy delicious, home-cooked meals without the stress.",
    aboutTitle: "Nutrition for a\nrushed world.",
    aboutSub: "In soup we trust. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.",
    bestSellersTitle: "BEST SELLING BROTH",
    shopBestSellers: "SHOP BEST SELLERS",
    reviews: "Reviews",
    subscribeTab: "Subscription",
    singleTab: "Single Purchase"
  }
};

// GROQ query — fetch products with dereferenced tags
const PRODUCTS_QUERY = `*[_type == "product"] | order(order asc) {
  _id,
  title,
  purchaseType,
  price,
  description,
  tagline,
  bgColor,
  image,
  hoverImage,
  "tags": tags[]->{ _id, name, slug, icon, color }
}`;

// ── Mock products (fallback when Sanity has no data) ──
const MOCK_TAG_VEG = { _id: 'mt1', name: { es: 'Vegetariano', en: 'Vegetarian' }, slug: { current: 'vegetariano' }, icon: '🥦', color: 'bg-ondo-green' };
const MOCK_TAG_HOT = { _id: 'mt2', name: { es: 'Caliente', en: 'Hot' }, slug: { current: 'caliente' }, icon: '🔥', color: 'bg-red-500' };
const MOCK_TAG_COLD = { _id: 'mt3', name: { es: 'Frío', en: 'Cold' }, slug: { current: 'frio' }, icon: '❄️', color: 'bg-sky-400' };
const MOCK_TAG_VEGAN = { _id: 'mt4', name: { es: 'Vegano', en: 'Vegan' }, slug: { current: 'vegano' }, icon: '🌿', color: 'bg-ondo-light-green' };

const MOCK_PRODUCTS = [
  {
    _id: 'mock-1',
    title: { es: 'Crema de Elote', en: 'Corn Cream Soup' },
    purchaseType: 'subscription',
    price: 89,
    tagline: { es: 'Dulce y ahumado, como debe ser.', en: 'Sweet and smoky, as it should be.' },
    description: { es: 'Crema suave de elote asado con un toque de chile poblano y crema mexicana. Reconfortante y lista en 5 minutos.', en: 'Smooth roasted corn cream with poblano chile and Mexican crema. Comforting and ready in 5 minutes.' },
    bgColor: 'bg-amber-50',
    image: '/images/ondo-113.JPG',
    hoverImage: '/images/ondo-051.JPG',
    tags: [MOCK_TAG_VEG],
  },
  {
    _id: 'mock-2',
    title: { es: 'Pozole Rojo', en: 'Red Pozole' },
    purchaseType: 'subscription',
    price: 115,
    tagline: { es: 'La fiesta en tu mesa.', en: 'The party at your table.' },
    description: { es: 'Caldo rojo intenso con maíz cacahuazintle, chile guajillo y todo el sabor de la tradición mexicana.', en: 'Intense red broth with hominy corn, guajillo chile and all the flavor of Mexican tradition.' },
    bgColor: 'bg-red-50',
    image: '/images/ondo-070.JPG',
    hoverImage: '/images/ondo-113.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-3',
    title: { es: 'Sopa de Lima Yucateca', en: 'Yucatan Lime Soup' },
    purchaseType: 'subscription',
    price: 99,
    tagline: { es: 'El sur en cada sorbo.', en: 'The south in every sip.' },
    description: { es: 'Caldo ligero con pollo deshebrado, chile xcatic, lima yucateca y tortilla crujiente.', en: 'Light broth with shredded chicken, xcatic chile, Yucatan lime and crispy tortilla.' },
    bgColor: 'bg-lime-50',
    image: '/images/ondo-051.JPG',
    hoverImage: '/images/ondo-070.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-4',
    title: { es: 'Gazpacho Verde', en: 'Green Gazpacho' },
    purchaseType: 'single',
    price: 79,
    tagline: { es: 'Frío y lleno de vida.', en: 'Cold and full of life.' },
    description: { es: 'Pepino, aguacate, espinaca y limón batidos en frío. Perfecto para el verano.', en: 'Cucumber, avocado, spinach and lemon blended cold. Perfect for summer.' },
    bgColor: 'bg-green-50',
    image: '/images/green-soup.png',
    hoverImage: '/images/green-soup.png',
    tags: [MOCK_TAG_VEGAN, MOCK_TAG_COLD],
  },
  {
    _id: 'mock-5',
    title: { es: 'Caldo Tlalpeño', en: 'Tlalpeño Broth' },
    purchaseType: 'single',
    price: 105,
    tagline: { es: 'Humo, garbanzo y corazón.', en: 'Smoke, chickpea and heart.' },
    description: { es: 'Caldo de pollo ahumado con garbanzos, chile chipotle, epazote y ejotes. Un clásico chilango con alma.', en: 'Smoked chicken broth with chickpeas, chipotle chile and green beans. A soulful classic.' },
    bgColor: 'bg-orange-50',
    image: '/images/ondo-070.JPG',
    hoverImage: '/images/ondo-113.JPG',
    tags: [MOCK_TAG_HOT],
  },
  {
    _id: 'mock-6',
    title: { es: 'Vichyssoise de Huitlacoche', en: 'Huitlacoche Vichyssoise' },
    purchaseType: 'single',
    price: 125,
    tagline: { es: 'Lujo mexicano frío.', en: 'Cold Mexican luxury.' },
    description: { es: 'Crema fría de papa y poro realzada con el intenso sabor terroso del huitlacoche.', en: 'Cold cream of potato and leek elevated with the intense earthy flavor of huitlacoche.' },
    bgColor: 'bg-stone-100',
    image: '/images/ondo-051.JPG',
    hoverImage: '/images/green-soup.png',
    tags: [MOCK_TAG_VEGAN, MOCK_TAG_COLD],
  },
];

export default function App() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [purchaseMode, setPurchaseMode] = useState<'subscription' | 'single'>('subscription');
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  // Products state: starts with mock data, replaced only if Sanity returns real products
  const [displayProducts, setDisplayProducts] = useState<any[]>(MOCK_PRODUCTS);

  // Delivery modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPostal, setDeliveryPostal] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'ok' | 'nok'>('idle');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [deliveryZones, setDeliveryZones] = useState<any>(null);
  const hasValidatedDelivery = typeof window !== 'undefined' && localStorage.getItem('ondo_delivery_validated') === 'true';

  // Cart mixing warning
  const [showMixWarning, setShowMixWarning] = useState(false);
  const [mixPendingProduct, setMixPendingProduct] = useState<any>(null);

  // Product detail popup
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Tags / filtering
  const [tags, setTags] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Subscription Popup
  const [showPopupModal, setShowPopupModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteSettings, productSettings, processSettings, manifestoSettings, popupSettings, fetchedTags, fetchedZones, fetchedProducts] = await Promise.all([
          client.fetch('*[_type == "siteSettings"][0]'),
          client.fetch('*[_type == "productSettings"][0]'),
          client.fetch('*[_type == "processSettings"][0]'),
          client.fetch('*[_type == "manifestoSettings"][0]'),
          client.fetch('*[_type == "popupSettings"][0]'),
          client.fetch('*[_type == "productTag"] | order(order asc)'),
          client.fetch('*[_type == "deliveryZones"][0]'),
          client.fetch(PRODUCTS_QUERY),
        ]);
        setSettings({
          ...siteSettings,
          ...productSettings,
          ...processSettings,
          ...manifestoSettings,
          ...popupSettings
        });
        setTags(fetchedTags || []);
        setDeliveryZones(fetchedZones || null);
        // Only replace mock data if Sanity actually has products
        if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
          setDisplayProducts(fetchedProducts);
        }
        // If 0 real products: keep showing mock data (already initialized)
      } catch (e) {
        console.error('Sanity fetch error, mock data will stay:', e);
        // Mock data remains unchanged on error
      }
    };
    fetchData();
  }, []);

  const getSetting = (key: string, defaultVal: any = null) => {
    return settings?.[key] ?? defaultVal;
  };

  const content = t[lang];

  // Always use displayProducts (starts as mock, replaced by real Sanity data when available)
  const singleProducts = displayProducts.filter((p: any) => p.purchaseType === 'single');
  const subscriptionProducts = displayProducts.filter((p: any) => p.purchaseType === 'subscription');
  const products = purchaseMode === 'subscription' ? subscriptionProducts : singleProducts;

  // Helper: resolve title/description fields that may be translationRecord or plain string
  const resolveText = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.es || field.en || '';
  };

  // Helper: resolve image src from Sanity image or plain URL string
  const resolveImage = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    try { return urlFor(img).width(800).url(); } catch { return ''; }
  };

  const filteredProducts = activeFilters.length === 0
    ? products
    : products.filter((p: any) =>
        p.tags && activeFilters.every((slug: string) =>
          p.tags.some((tag: any) => tag?.slug?.current === slug)
        )
      );

  const doAddToCart = (product: any) => {
    setCart(prev => {
      const exists = prev.find(item => item.product._id === product._id);
      if (exists) {
        return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const addToCart = (product: any) => {
    // Check purchase type mixing
    const cartType = cart.length > 0 ? (cart[0].product as any).purchaseType : null;
    const productType = (product as any).purchaseType || purchaseMode;
    if (cartType && cartType !== productType) {
      setMixPendingProduct(product);
      setShowMixWarning(true);
      return;
    }
    // First-time delivery validation
    if (!hasValidatedDelivery) {
      setPendingProduct(product);
      setShowDeliveryModal(true);
      return;
    }
    doAddToCart(product);
  };

  const checkDelivery = async () => {
    setDeliveryStatus('checking');
    const allowed: string[] = deliveryZones?.allowedPostalCodes || [];
    const isOk = allowed.length === 0 || allowed.map((c: string) => c.trim()).includes(deliveryPostal.trim());
    setDeliveryStatus(isOk ? 'ok' : 'nok');
    // Save lead to Sanity
    try {
      await writeClient.create({
        _type: 'deliveryLead',
        address: deliveryAddress,
        postalCode: deliveryPostal,
        isServiceable: isOk,
        createdAt: new Date().toISOString(),
      });
    } catch (e) { console.error('Lead save error', e); }
    if (isOk) {
      localStorage.setItem('ondo_delivery_validated', 'true');
    }
  };

  const submitNotifyEmail = async () => {
    try {
      await writeClient.patch(
        { query: `*[_type == "deliveryLead" && postalCode == "${deliveryPostal}" && !defined(email)][0]` }
      ).set({ email: notifyEmail }).commit();
    } catch (e) { console.error(e); }
    setEmailSent(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
    setNotifyEmail('');
    setEmailSent(false);
    if (deliveryStatus === 'ok' && pendingProduct) doAddToCart(pendingProduct);
    setPendingProduct(null);
  };

  const confirmDeliveryAndClose = () => {
    if (pendingProduct) doAddToCart(pendingProduct);
    setPendingProduct(null);
    setShowDeliveryModal(false);
    setDeliveryStatus('idle');
    setDeliveryAddress('');
    setDeliveryPostal('');
  };

  const toggleFilter = (slug: string) => {
    setActiveFilters(prev =>
      prev.includes(slug) ? prev.filter(f => f !== slug) : [...prev, slug]
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((a, b) => a + (b.product.price * b.quantity), 0);
  const progressPercent = Math.min((cartSubtotal / 120) * 100, 100);

  return (
    <div className="min-h-screen bg-ondo-beige text-ondo-black overflow-x-hidden font-body">
      {/* Top Banner (ROJO BANNER) */}
      <div className="bg-ondo-red text-white py-2 text-xs md:text-sm font-bold tracking-wider uppercase font-title leading-none overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-flex w-[200%] justify-around">
          <span>{getSetting('bannerText', content.banner)}</span>
          <span>{getSetting('bannerText', content.banner)}</span>
        </div>
      </div>
      
      {/* Navbar (Crema Suave) */}
      <nav className="sticky top-0 z-30 bg-ondo-beige border-b border-black/5">
        <div className="w-full mx-auto px-6 py-5 md:py-7 flex items-center justify-between relative">
          <div className="flex items-center gap-8 hidden md:flex font-title font-semibold text-[15px] tracking-wide">
            <a href="#shop" className="hover:text-ondo-orange transition-colors">{getSetting('navShop', content.navShop)}</a>
            <a href="#manifesto" className="hover:text-ondo-orange transition-colors">{getSetting('navSubs', content.navSubs)}</a>
          </div>
          <div className="md:hidden">
            <Menu className="w-6 h-6 text-ondo-green" />
          </div>
          
          <a href="#" className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/Group 1597787.png" alt="ONDO Logo" className="h-[36px] md:h-[46px] object-contain" />
          </a>
        
        <div className="flex items-center gap-4 sm:gap-6">
           <div className="hidden md:flex gap-6 font-title font-semibold text-sm tracking-wide">
             <a href="#steps" className="hover:text-ondo-orange transition-colors">{getSetting('navSteps', content.navSteps)}</a>
             <a href="#about" className="hover:text-ondo-orange transition-colors">{getSetting('navAbout', content.navAbout)}</a>
           </div>

           {/* Lang Toggle */}
           <div className="flex items-center gap-2 font-title font-bold text-xs uppercase bg-white/40 px-2 py-1 rounded-md border border-ondo-black/5">
              <button 
                onClick={() => setLang('es')} 
                className={`${lang === 'es' ? 'text-ondo-orange' : 'text-gray-400 hover:text-ondo-black'}`}
              >
                ES
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setLang('en')} 
                className={`${lang === 'en' ? 'text-ondo-orange' : 'text-gray-400 hover:text-ondo-black'}`}
              >
                EN
              </button>
           </div>

           <Search className="w-5 h-5 cursor-pointer text-ondo-green hover:text-ondo-orange transition-colors" />
           <User className="w-5 h-5 cursor-pointer hidden sm:block text-ondo-green hover:text-ondo-orange transition-colors" />
           <div className="relative cursor-pointer group text-ondo-green hover:text-ondo-orange transition-colors" onClick={() => setIsCartOpen(true)}>
             <ShoppingCart className="w-6 h-6" />
             {cartItemCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-ondo-red text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow group-hover:bg-ondo-orange transition-colors">
                 {cartItemCount}
               </span>
             )}
           </div>
        </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-ondo-black/40 z-40 transition-opacity backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-ondo-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="bg-ondo-beige p-4 flex items-center justify-between border-b border-black/5">
          <div className="flex-1" />
          <h2 className="font-title font-bold text-xl uppercase tracking-wide">ONDO</h2>
          <div className="flex-1 flex justify-end">
             <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-ondo-light-green rounded-full transition-colors"><X className="w-6 h-6 text-ondo-black" /></button>
          </div>
        </div>

        {/* Promo Bar */}
        <div className="bg-ondo-beige/50 p-5 border-b border-gray-100">
          <div className="w-full bg-white rounded-full h-3 mb-2 relative">
             <div className="bg-ondo-orange h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
               <ShoppingCart className="w-16 h-16 mb-4 opacity-20 text-ondo-green" />
               <p className="font-title uppercase tracking-widest text-lg">{getSetting('emptyCart', content.emptyCart)}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product._id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50 items-center">
                <div className={`w-16 h-20 ${item.product.bgColor || 'bg-ondo-beige'} rounded-xl overflow-hidden shrink-0`}>
                   <img src={resolveImage(item.product.image)} className="w-full h-full object-cover mix-blend-multiply" alt="product" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between gap-2 mb-2">
                      <h4 className="font-title font-bold text-[15px] leading-tight text-ondo-black pr-2">{resolveText(item.product.title)}</h4>
                      <div className="font-body font-semibold text-sm whitespace-nowrap text-right">
                         €{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                   </div>
                   <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-100 rounded-lg bg-ondo-white">
                         <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green rounded-l-lg transition-colors"><Minus className="w-3 h-3" /></button>
                         <span className="font-title text-[15px] w-6 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green rounded-r-lg transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.product._id)} className="text-gray-300 hover:text-ondo-red transition-colors"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-50 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.05)] shrink-0 z-10 relative">
            <div className="flex justify-between items-center mb-6">
              <span className="font-title text-xl text-gray-500">{getSetting('subtotal', content.subtotal)}</span>
              <span className="font-title text-[28px] font-bold text-ondo-black">€{cartSubtotal.toFixed(2)}</span>
            </div>
            <button className="w-full bg-ondo-orange hover:bg-ondo-light-green hover:text-ondo-black text-white font-title font-bold uppercase tracking-widest py-5 rounded-[14px] text-lg transition-colors shadow-md">
              {getSetting('checkout', content.checkout)}
            </button>
          </div>
        )}
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center h-[calc(100vh-98px)] bg-ondo-beige pb-10">
        <div className="absolute inset-0 bg-ondo-beige/10 z-0 transition-opacity duration-300"></div>
        
        {/* Render hero images centered in the right half */}
        <div className="absolute inset-y-0 right-0 flex items-center justify-center pointer-events-none z-0 w-full md:w-1/2">
            <img 
              src="/images/green-soup.png" 
              alt="Hero Soup" 
              className="w-auto object-contain scale-100 md:scale-110"
              style={{ maxHeight: '85vh', maxWidth: '90%' }}
            />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-16 h-full flex flex-col justify-center">
          <div className="max-w-[500px] w-full flex flex-col justify-center bg-transparent mt-[-10vh]">
             <h1 className="text-[55px] md:text-[85px] lg:text-[110px] font-title leading-[0.85] tracking-tight mb-8 text-ondo-green uppercase w-[150%] max-w-[800px] relative z-20 mix-blend-multiply text-shadow-sm font-black text-left">
              {getSetting('heroTitle', content.heroTitle)}
            </h1>
            <div>
              <p className="text-[17px] md:text-[20px] font-body mb-8 text-ondo-green leading-relaxed font-bold max-w-[420px] mix-blend-multiply">
                 {getSetting('heroSub', content.heroSub)}
              </p>
              <div>
                <button className="bg-ondo-green text-white hover:bg-ondo-light-green hover:text-ondo-black font-title font-bold uppercase tracking-widest py-4 px-10 transition-colors text-[15px] shadow-sm rounded-full">
                  {getSetting('heroCTA', content.shopNow)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-6 bg-ondo-beige" id="shop">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
            {/* Sidebar Filters — dynamic from Sanity productTag */}
             <div className="w-full md:w-1/4 xl:w-1/5 shrink-0 flex flex-col gap-4">
               <h3 className="font-title font-bold text-xl mb-2 text-ondo-black uppercase flex items-center justify-between">
                 {getSetting('filtersTitle', content.filtersTitle)}
                 {activeFilters.length > 0 && (
                   <button onClick={() => setActiveFilters([])} className="text-xs text-ondo-orange font-bold tracking-wide normal-case underline underline-offset-2">
                     {lang === 'es' ? 'Borrar' : 'Clear'}
                   </button>
                 )}
               </h3>

               {tags.length === 0 ? (
                 <>
                   <button className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 font-title hover:border-ondo-orange group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                     <div className="w-5 h-5 bg-ondo-green rounded flex items-center justify-center shrink-0"><span className="text-white text-[10px]">🥦</span></div>
                     {getSetting('filterBundle', content.filterBundle)}
                   </button>
                   <button className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 font-title hover:border-ondo-orange group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                     <div className="w-5 h-5 bg-ondo-orange rounded flex items-center justify-center text-white shrink-0"><span className="text-[10px]">❄️</span></div>
                     {getSetting('filterNew', content.filterNew)}
                   </button>
                   <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 rounded-2xl border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-orange group w-full text-left">
                     <div className="w-5 h-5 bg-ondo-yellow rounded flex items-center justify-center text-ondo-orange shrink-0"><span className="text-[12px]">🔥</span></div>
                     {getSetting('filterBestseller', content.filterBestseller)}
                   </button>
                   <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 rounded-2xl border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-orange group w-full text-left">
                     <div className="w-5 h-5 bg-ondo-light-green rounded flex items-center justify-center text-white shrink-0"><span className="text-[12px]">🌿</span></div>
                     {getSetting('filterVegan', content.filterVegan)}
                   </button>
                 </>
               ) : (
                 tags.map((tag: any) => {
                   const slug = tag?.slug?.current || tag._id;
                   const isActive = activeFilters.includes(slug);
                   return (
                     <button
                       key={tag._id}
                       onClick={() => toggleFilter(slug)}
                       className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-all w-full text-left border ${
                         isActive
                           ? 'bg-ondo-orange text-white border-ondo-orange scale-[1.02]'
                           : 'bg-white text-ondo-black border-gray-100 hover:border-ondo-orange'
                       }`}
                     >
                       <div className={`w-5 h-5 ${tag.color || 'bg-ondo-green'} rounded flex items-center justify-center shrink-0`}>
                         <span className="text-[12px]">{tag.icon || '•'}</span>
                       </div>
                       {tag.name?.[lang] || tag.name?.es || tag.name?.en || slug}
                     </button>
                   );
                 })
               )}

               <div className="mt-4 flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 font-title font-bold shadow-sm text-sm uppercase tracking-wide cursor-pointer hover:border-ondo-orange hover:text-ondo-orange transition-colors w-full justify-between">
                 {getSetting('sortBy', content.sortBy)} <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
            </div>

            {/* Products Grid Area */}
            <div className="flex-1 flex flex-col">
              
              {/* Purchase Mode Toggle */}
              <div className="flex justify-center md:justify-end mb-8 relative">
                 <div className="bg-white p-1 rounded-full flex shadow-sm relative border border-gray-100 overflow-hidden">
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-ondo-orange rounded-full shadow-inner transition-all duration-300 z-0 ${purchaseMode === 'subscription' ? 'left-1' : 'left-[calc(50%+3px)]'}`}
                    />
                    <button 
                      onClick={() => setPurchaseMode('subscription')}
                      className={`relative z-10 px-6 py-2 rounded-full font-title text-[13px] font-bold uppercase tracking-wide transition-colors ${purchaseMode === 'subscription' ? 'text-white' : 'text-gray-400 hover:text-ondo-black'}`}
                    >
                      {getSetting('subscribeTab', content.subscribeTab)}
                    </button>
                    <button 
                      onClick={() => setPurchaseMode('single')}
                      className={`relative z-10 px-6 py-2 rounded-full font-title text-[13px] font-bold uppercase tracking-wide transition-colors ${purchaseMode === 'single' ? 'text-white' : 'text-gray-400 hover:text-ondo-black'}`}
                    >
                      {getSetting('singleTab', content.singleTab)}
                    </button>
                 </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredProducts.map((product: any) => (
                  <div key={product._id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-ondo-orange flex flex-col group transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-4">
                    
                    {/* Hover Image Area — click opens product detail */}
                    <div
                      className={`w-full aspect-[4/3] ${product.bgColor || 'bg-ondo-beige'} rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center p-6 cursor-pointer`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <img 
                        src={resolveImage(product.image)} 
                        alt={resolveText(product.title)} 
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-0" 
                      />
                      <img 
                        src={resolveImage(product.hoverImage) || resolveImage(product.image)} 
                        alt={`${resolveText(product.title)} hover`} 
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 scale-105 group-hover:scale-100" 
                      />
                    </div>

                    <div className="flex flex-col flex-1 px-2">
                      <div className="flex items-center text-ondo-yellow text-[11px] mb-2 tracking-widest">
                        ★★★★★ <span className="text-gray-300 font-body tracking-normal ml-2 underline underline-offset-2">(42)</span>
                      </div>
                      {/* Tags badges */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.tags.map((tag: any) => (
                            <span key={tag._id} className={`${tag.color || 'bg-ondo-light-green'} text-white text-[9px] font-title font-bold uppercase tracking-wide px-2 py-0.5 rounded-full`}>
                              {tag.icon} {resolveText(tag.name)}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-title text-[20px] font-bold mb-2 leading-[1.15] text-ondo-black line-clamp-2 uppercase">{resolveText(product.title)}</h3>
                      <div className="font-body text-ondo-green font-bold mb-5 text-[16px]">€{product.price?.toFixed(2)}</div>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between w-full rounded-xl overflow-hidden shadow-sm">
                          <button 
                            onClick={() => {
                              const productInCart = cart.find(item => item.product._id === product._id);
                              if (productInCart && productInCart.quantity > 0) {
                                updateQuantity(product._id, -1);
                              }
                            }} 
                            className={`p-3.5 w-1/3 flex justify-center bg-ondo-orange text-white ${cart.find(item => item.product._id === product._id)?.quantity ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="font-title text-[15px] font-bold w-1/3 text-center bg-ondo-white py-3.5">
                            {cart.find(item => item.product._id === product._id)?.quantity || 0}
                          </span>
                          
                          <button 
                            onClick={() => addToCart(product)} 
                            className="p-3.5 w-1/3 flex justify-center cursor-pointer bg-ondo-orange text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </section>

      {/* NUEVO BANNER ROJO EN MEDIO */}
      <div className="bg-ondo-red text-white py-3 md:py-4 text-center font-title text-sm md:text-base uppercase tracking-widest font-bold overflow-hidden whitespace-nowrap shrink-0">
        <div className="animate-marquee inline-flex w-[200%] justify-around">
          <span>{getSetting('midBannerText', content.midBanner)}</span>
          <span>{getSetting('midBannerText', content.midBanner)}</span>
        </div>
      </div>

      {/* Steps Section */}
      <section id="steps" className="py-28 px-6 bg-ondo-beige">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className="font-title text-[36px] md:text-[48px] font-bold text-ondo-black uppercase tracking-tight mb-16">{content.stepsTitle}</h2>
            <div className="grid md:grid-cols-3 gap-12">
               
               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square rounded-full overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src="/images/ondo-113.JPG" alt="Step 1" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{content.step1Title}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{content.step1Desc}</p>
               </div>
               
               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square rounded-full overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src="/images/ondo-051.JPG" alt="Step 2" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{content.step2Title}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{content.step2Desc}</p>
               </div>
               
               <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-[85%] mx-auto aspect-square rounded-full overflow-hidden mb-8 shadow-lg border-8 border-ondo-beige group-hover:scale-105 transition-transform duration-500 relative">
                    <img src="/images/ondo-070.JPG" alt="Step 3" className="w-full h-full object-cover absolute inset-0" />
                 </div>
                 <h3 className="font-title font-bold text-2xl uppercase tracking-wide mb-4 text-ondo-green">{content.step3Title}</h3>
                 <p className="font-body text-gray-500 text-[17px] leading-relaxed font-medium px-4">{content.step3Desc}</p>
               </div>

            </div>
         </div>
      </section>

      {/* Best Sellers deleted. We jump directly to Manifesto Section */}

      {/* Manifesto Section */}
      {getSetting('showManifesto', true) && (
        <section id="manifesto" className="bg-ondo-beige py-8 lg:py-16 px-4 lg:px-6">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            
            {/* Panel 1 */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] bg-[#6ca53a] flex flex-col p-8 relative overflow-hidden">
               <div className="z-10">
                 <h2 className="text-[#f1f3b0] font-title text-[70px] lg:text-[90px] font-bold leading-[0.85] tracking-tighter uppercase break-words">
                   {getSetting('panel1TitleTop', 'SOUP\nSOUP')}
                 </h2>
               </div>
               {/* Center Logo shape via mask */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120px] bg-[#bfe46b] opacity-80" 
                    style={{ WebkitMaskImage: "url('/images/ondo-logo-orange.png')", maskImage: "url('/images/ondo-logo-orange.png')", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }} />
               <div className="flex flex-col items-end z-10 w-full mt-auto mb-4">
                 <span className="text-[#f1f3b0] font-title lowercase text-2xl tracking-widest mb-4" style={{ fontFamily: 'Caveat, cursive' }}>{getSetting('panel1City', 'MEXICO CITY')}</span>
               </div>
               <div className="z-10">
                 <h2 className="text-[#bfe46b] font-title text-[70px] lg:text-[100px] font-bold leading-[0.8] tracking-tighter uppercase break-words">
                   {getSetting('panel1TitleBottom', 'FIRST')}
                 </h2>
               </div>
            </div>
            
            {/* Panel 2 */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] bg-cover bg-center flex flex-col items-center justify-center p-4 relative"
                 style={{ backgroundImage: `url('${getSetting('panel2Image', null) ? urlFor(getSetting('panel2Image', null)).url() : '/images/ondo-113.JPG'}')` }}>
               <div className="w-full h-full max-w-[340px] bg-ondo-white shadow-2xl flex flex-col justify-between p-6 lg:p-8 text-center relative z-10 mx-auto my-auto max-h-[85%] md:max-h-[90%]">
                  <div>
                    <img src="/images/ondo-logo-orange.png" className="h-[40px] md:h-16 mx-auto mb-6 object-contain" alt="Ondo Logo" />
                    <h3 className="text-[#6ca53a] font-title text-[32px] md:text-[40px] font-bold uppercase leading-none tracking-tight mb-8">
                       {getSetting('panel2Title', 'FIRST WE SOUP')}
                    </h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[#6ca53a] font-body text-[14px] font-bold leading-relaxed mb-8 px-2">
                      {getSetting('panel2Mission', 'Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.')}
                    </p>
                    <button className="border-[3px] border-[#6ca53a] text-[#6ca53a] uppercase font-title font-bold text-sm tracking-widest px-6 py-3 hover:bg-[#6ca53a] hover:text-white transition-colors w-full">
                      {getSetting('panel2CTA', '¡APAPÁCHATE!')}
                    </button>
                  </div>
               </div>
            </div>
            
            {/* Panel 3 */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col">
               <div className="flex-1 bg-ondo-black p-8 flex flex-col justify-center">
                 <h2 className="text-ondo-white font-title text-[38px] lg:text-5xl font-bold tracking-tighter mb-6 leading-[0.9]">{getSetting('panel3Title', '¡Apapáchate!')}</h2>
                 <p className="text-white/80 font-body text-[13px] leading-relaxed mb-10 max-w-[95%]">
                   {getSetting('panel3Text', 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation.\n\nOur Mission is to nourish body and community with depth — in flavor, sourcing, and experience.')}
                 </p>
                 <a href="#" className="text-white font-title font-bold text-[13px] tracking-widest uppercase underline underline-offset-8 hover:text-ondo-orange transition-colors">
                   {getSetting('panel3CTA', 'LEARN MORE')}
                 </a>
               </div>
               <div className="flex-1 bg-[#bfe46b] relative overflow-hidden flex items-center justify-center min-h-[250px]">
                 <img src="/images/green-geo.png" alt="Ondo Graphic" className="w-full h-full object-cover" />
               </div>
            </div>
            
            {/* Panel 4 */}
            <div className="min-h-[500px] md:h-[600px] lg:h-[750px] bg-ondo-white p-8 flex flex-col relative overflow-hidden">
               <p className="text-[#5b9538] font-body font-bold text-[14px] leading-relaxed mb-10 max-w-[95%]">
                 {getSetting('panel4TextTop', 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation.\n\nOur Mission is to nourish body and community with depth — in flavor, sourcing, and experience.')}
               </p>
               <div className="flex justify-between w-full mb-auto z-10">
                 <span className="text-[#5b9538] font-title font-bold uppercase text-[12px] tracking-widest">{getSetting('panel4CityLeft', 'SOUP FIRST')}</span>
                 <span className="text-[#5b9538] font-title font-bold uppercase text-[12px] tracking-widest">{getSetting('panel4CityRight', 'CDMX')}</span>
               </div>
               
               <div className="mt-auto z-10 relative pointer-events-none flex flex-col justify-end mb-16">
                 <h2 className="text-[#5b9538] font-title text-[50px] lg:text-[70px] font-bold leading-[0.8] tracking-tighter uppercase mb-8">
                   {getSetting('panel4Title', 'IN SOUP WE TRUST')}
                 </h2>
               </div>
               {/* Massive Logo at bottom */}
               <div className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 w-full h-[150px] bg-[#5b9538] opacity-90" 
                    style={{ WebkitMaskImage: "url('/images/ondo-logo-orange.png')", maskImage: "url('/images/ondo-logo-orange.png')", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "bottom center", maskPosition: "bottom center" }} />
            </div>
            
          </div>
        </section>
      )}

      {/* Brand Text Section */}
      <section className="bg-ondo-beige py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-24">
          <div className="hidden md:block w-32 shrink-0">
             {/* Spacing for typography layout look */}
          </div>
          <div className="flex-1">
             <h2 className="text-[#6ca53a] font-title text-[40px] md:text-[50px] lg:text-[65px] font-bold leading-[0.95] tracking-tight mb-16 whitespace-pre-line">
               {getSetting('aboutTitle', 'Ondo is a soup-first\nbrand in Mexico City')}
             </h2>
             
             <h4 className="text-[#6ca53a] font-title text-[12px] font-bold uppercase tracking-[0.2em] mb-6">{getSetting('aboutHeader', 'ABOUT')}</h4>
             
             <p className="text-[#5b9538] font-body text-[16px] md:text-[18px] font-bold leading-relaxed mb-12 max-w-[80%] whitespace-pre-line">
               {getSetting('aboutSub', 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.')}
             </p>
             
             <div className="flex items-center gap-8 border-t border-[#6ca53a]/20 pt-8">
               <a href="#" className="text-[#6ca53a] font-title font-bold text-[13px] tracking-widest uppercase underline underline-offset-8 hover:text-ondo-orange transition-colors">
                 {getSetting('aboutLink', 'LEARN MORE')}
               </a>
               <button className="border border-[#6ca53a] text-[#6ca53a] uppercase font-title font-bold text-xs tracking-widest px-6 py-3 hover:bg-[#6ca53a] hover:text-white transition-colors">
                 {getSetting('aboutCTA', '¡APAPÁCHATE!')}
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ondo-beige text-ondo-black py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="text-[40px] md:text-[52px] font-title font-bold text-ondo-black uppercase tracking-tighter">
             ONDO
           </div>
           <div className="flex flex-wrap justify-center gap-8 font-title text-[14px] md:text-[16px] text-gray-400 font-bold uppercase tracking-widest">
             <a href="#" className="hover:text-ondo-light-green transition-colors">FAQ</a>
             <a href="#" className="hover:text-ondo-light-green transition-colors">Contact</a>
             <a href="#" className="hover:text-ondo-light-green transition-colors">Terms</a>
             <a href="#" className="hover:text-ondo-light-green transition-colors">Privacy</a>
             <a href="#" className="hover:text-ondo-light-green transition-colors">Wholesale</a>
           </div>
           <div className="text-gray-500 font-body text-sm font-medium">
             © 2026 ONDO. All rights reserved.
           </div>
         </div>
      </footer>

      {/* ── MODAL: Delivery Address ── */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-ondo-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={closeDeliveryModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-ondo-beige transition-colors">
              <X className="w-5 h-5 text-ondo-black" />
            </button>

            {deliveryStatus === 'idle' || deliveryStatus === 'checking' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-ondo-orange rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-title font-bold text-2xl uppercase text-ondo-black">
                    {lang === 'es' ? '¿Dónde te enviamos?' : 'Where do we deliver?'}
                  </h2>
                </div>
                <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
                  {lang === 'es'
                    ? 'Antes de añadir al carrito, cuéntanos dónde estás para confirmar que podemos llegar hasta ti.'
                    : 'Before adding to cart, let us know where you are so we can confirm we deliver to you.'}
                </p>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder={lang === 'es' ? 'Tu dirección (opcional)' : 'Your address (optional)'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm mb-3 focus:outline-none focus:border-ondo-orange bg-white"
                />
                <input
                  type="text"
                  value={deliveryPostal}
                  onChange={e => setDeliveryPostal(e.target.value)}
                  placeholder={lang === 'es' ? 'Código postal *' : 'Postal code *'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-sm mb-5 focus:outline-none focus:border-ondo-orange bg-white"
                />
                <button
                  onClick={checkDelivery}
                  disabled={!deliveryPostal.trim() || deliveryStatus === 'checking'}
                  className="w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {deliveryStatus === 'checking'
                    ? (lang === 'es' ? 'Comprobando…' : 'Checking…')
                    : (lang === 'es' ? 'Confirmar zona' : 'Confirm zone')}
                </button>
              </>
            ) : deliveryStatus === 'ok' ? (
              <>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <CheckCircle className="w-16 h-16 text-ondo-green" />
                  <h2 className="font-title font-bold text-2xl uppercase text-ondo-black">
                    {deliveryZones?.inZoneMessageEs && lang === 'es'
                      ? deliveryZones.inZoneMessageEs
                      : deliveryZones?.inZoneMessageEn || '¡Perfecto! Repartimos en tu zona 🎉'}
                  </h2>
                  <p className="font-body text-gray-500 text-sm">
                    {lang === 'es' ? 'Ya puedes añadir tus productos al carrito.' : 'You can now add products to your cart.'}
                  </p>
                  <button
                    onClick={confirmDeliveryAndClose}
                    className="bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 px-8 rounded-xl text-sm mt-2"
                  >
                    {lang === 'es' ? 'Continuar comprando' : 'Continue shopping'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <AlertTriangle className="w-16 h-16 text-ondo-orange" />
                  <h2 className="font-title font-bold text-xl uppercase text-ondo-black">
                    {deliveryZones?.outOfZoneMessageEs && lang === 'es'
                      ? deliveryZones.outOfZoneMessageEs
                      : deliveryZones?.outOfZoneMessageEn || 'Pronto repartiremos en tu zona.'}
                  </h2>
                  {!emailSent ? (
                    <>
                      <p className="font-body text-gray-500 text-sm">
                        {lang === 'es' ? 'Déjanos tu correo y te avisamos.' : 'Leave your email and we\'ll notify you.'}
                      </p>
                      <div className="flex w-full gap-2 mt-2">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={e => setNotifyEmail(e.target.value)}
                          placeholder={lang === 'es' ? 'tu@correo.com' : 'your@email.com'}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-ondo-orange bg-white"
                        />
                        <button
                          onClick={submitNotifyEmail}
                          disabled={!notifyEmail.trim()}
                          className="bg-ondo-green text-white font-title font-bold uppercase px-4 rounded-xl text-xs disabled:opacity-40"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="font-body text-ondo-green font-bold text-sm">
                      {lang === 'es' ? '¡Gracias! Te avisamos cuando estemos ahí 🌿' : 'Thanks! We\'ll notify you when we arrive 🌿'}
                    </p>
                  )}
                  <button onClick={closeDeliveryModal} className="text-sm text-gray-400 underline mt-2 font-body">
                    {lang === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Cart Mix Warning ── */}
      {showMixWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-ondo-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative text-center">
            <AlertTriangle className="w-12 h-12 text-ondo-orange mx-auto mb-4" />
            <h2 className="font-title font-bold text-xl uppercase text-ondo-black mb-3">
              {lang === 'es' ? 'No se puede mezclar' : 'Cannot mix types'}
            </h2>
            <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
              {lang === 'es'
                ? 'No puedes combinar productos de suscripción con compras únicas en el mismo pedido. ¿Quieres vaciar el carrito y añadir este producto?'
                : 'You cannot combine subscription and single-purchase products in the same order. Would you like to clear the cart and add this product?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCart([]);
                  if (mixPendingProduct) {
                    if (!hasValidatedDelivery) {
                      setPendingProduct(mixPendingProduct);
                      setShowMixWarning(false);
                      setShowDeliveryModal(true);
                    } else {
                      doAddToCart(mixPendingProduct);
                      setShowMixWarning(false);
                    }
                  }
                  setMixPendingProduct(null);
                }}
                className="flex-1 bg-ondo-orange text-white font-title font-bold uppercase tracking-wide py-3 rounded-xl text-xs"
              >
                {lang === 'es' ? 'Vaciar y añadir' : 'Clear & add'}
              </button>
              <button
                onClick={() => { setShowMixWarning(false); setMixPendingProduct(null); }}
                className="flex-1 border border-gray-200 text-gray-500 font-title font-bold uppercase tracking-wide py-3 rounded-xl text-xs hover:border-ondo-black transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Product Detail ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-ondo-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className={`${selectedProduct.bgColor || 'bg-ondo-beige'} relative w-full aspect-[4/3] shrink-0`}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover mix-blend-multiply"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-ondo-black" />
              </button>
            </div>
            {/* Content */}
            <div className="p-7 overflow-y-auto flex flex-col gap-4">
              <div className="flex items-center text-ondo-yellow text-[11px] tracking-widest">
                ★★★★★ <span className="text-gray-300 font-body tracking-normal ml-2 underline underline-offset-2">(42)</span>
              </div>
              <h2 className="font-title font-bold text-2xl uppercase leading-tight text-ondo-black">
                {selectedProduct.title}
              </h2>
              {selectedProduct.tagline && (
                <p className="font-body italic text-ondo-green font-bold text-[15px]">
                  {typeof selectedProduct.tagline === 'object'
                    ? selectedProduct.tagline[lang] || selectedProduct.tagline.es
                    : selectedProduct.tagline}
                </p>
              )}
              <div className="font-body text-ondo-green font-bold text-[20px]">
                €{selectedProduct.price?.toFixed(2)}
              </div>
              {selectedProduct.description && (
                <p className="font-body text-gray-600 text-sm leading-relaxed">
                  {typeof selectedProduct.description === 'object'
                    ? selectedProduct.description[lang] || selectedProduct.description.es
                    : selectedProduct.description}
                </p>
              )}
              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProduct.tags.map((tag: any) => (
                    <span key={tag._id || tag} className={`${tag.color || 'bg-ondo-light-green'} text-white text-[11px] font-title font-bold uppercase tracking-wide px-3 py-1 rounded-full`}>
                      {tag.icon} {tag.name?.[lang] || tag.name?.es || tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Add to cart from modal */}
              <button
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="mt-2 w-full bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 rounded-xl text-sm"
              >
                {lang === 'es' ? 'Añadir al carrito' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATIC FLOATING BUTTON (BOTTOM LEFT) ── */}
      {getSetting('enabled', true) !== false && (
        <button
          onClick={() => setShowPopupModal(true)}
          className="fixed bottom-6 left-6 z-[45] bg-ondo-orange text-white font-title font-bold uppercase tracking-widest px-6 py-4 rounded-full shadow-2xl hover:bg-ondo-light-green hover:text-ondo-black transition-colors flex items-center gap-3 border-2 border-transparent hover:border-ondo-black"
        >
          <Mail className="w-5 h-5" />
          {resolveText(getSetting('buttonText', { es: '¡Suscríbete!', en: 'Subscribe!' })) || 'Suscríbete'}
        </button>
      )}

      {/* ── MODAL: Subscription Popup ── */}
      {showPopupModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPopupModal(false)}>
          <div
            className="bg-ondo-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopupModal(false)}
              className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-colors z-10"
            >
              <X className="w-5 h-5 text-ondo-black" />
            </button>
            {getSetting('popupImage') && (
              <div className="w-full aspect-[4/3] bg-ondo-beige relative shrink-0">
                <img
                  src={resolveImage(getSetting('popupImage'))}
                  alt="Subscription Popup"
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
            )}
            <div className="p-8 text-center flex flex-col items-center">
              {!getSetting('popupImage') && <Mail className="w-12 h-12 text-ondo-orange mb-4" />}
              <h2 className="font-title font-bold text-2xl uppercase leading-tight text-ondo-black mb-3">
                {resolveText(getSetting('popupTitle', { es: '¡Únete al club de la sopa!', en: 'Join the soup club!' })) || '¡Únete al club de la sopa!'}
              </h2>
              <p className="font-body text-gray-500 text-[15px] leading-relaxed mb-8">
                {resolveText(getSetting('popupMessage', { es: 'Suscríbete a nuestros envíos regulares y ahorra tiempo y dinero. ¡Nutrición lista siempre!', en: 'Subscribe to regular deliveries and save time and money. Ready nutrition always!' }))}
              </p>
              <button
                onClick={() => {
                  setShowPopupModal(false);
                  setPurchaseMode('subscription');
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-ondo-orange hover:bg-ondo-light-green hover:text-ondo-black text-white font-title font-bold uppercase tracking-widest py-4 rounded-xl text-[15px] transition-colors border border-transparent hover:border-ondo-black shadow-md"
              >
                {resolveText(getSetting('popupCTA', { es: 'Suscribirme', en: 'Subscribe' })) || 'Suscribirme'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
