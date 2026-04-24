import React, { useState } from 'react';
import { ShoppingCart, Search, User, X, ChevronRight, Menu, Plus, Minus, Trash2, Package } from 'lucide-react';

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

const mockProductsSingle = [
  { id: 1, title: 'Tomate y Albahaca - 14 oz', price: 19.99, image: '/images/ondo-011.JPG', hoverImage: '/images/ondo-118.JPG', bgColor: 'bg-ondo-light-green' },
  { id: 2, title: 'Sopa de Verduras - 16.9 oz', price: 8.49, image: '/images/ondo-051.JPG', hoverImage: '/images/ondo-011.JPG', bgColor: 'bg-ondo-beige' },
  { id: 3, title: 'Caldo de Pollo - 16.9 oz', price: 8.49, image: '/images/ondo-065.JPG', hoverImage: '/images/ondo-104.JPG', bgColor: 'bg-ondo-yellow' },
  { id: 4, title: 'Crema de Hongo - 16.9 oz', price: 8.99, image: '/images/ondo-070.JPG', hoverImage: '/images/ondo-112.JPG', bgColor: 'bg-ondo-light-green' },
  { id: 5, title: 'Sopa de Lentejas - 16.9 oz', price: 9.49, image: '/images/ondo-104.JPG', hoverImage: '/images/ondo-113.JPG', bgColor: 'bg-ondo-green' },
  { id: 6, title: 'Sopa Fideos - 16.9 oz', price: 8.49, image: '/images/ondo-112.JPG', hoverImage: '/images/ondo-070.JPG', bgColor: 'bg-ondo-white' },
];

const mockProductsSubscription = mockProductsSingle.map(p => ({
  ...p,
  id: p.id + 100,
  title: p.title + ' (Auto-Envío)',
  price: p.price * 0.8,
}));

export default function App() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [purchaseMode, setPurchaseMode] = useState<'subscription' | 'single'>('subscription');
  const [cart, setCart] = useState<{product: typeof mockProductsSingle[0], quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const content = t[lang];
  const products = purchaseMode === 'subscription' ? mockProductsSubscription : mockProductsSingle;

  const addToCart = (product: typeof mockProductsSingle[0]) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((a, b) => a + (b.product.price * b.quantity), 0);
  const progressPercent = Math.min((cartSubtotal / 120) * 100, 100);

  return (
    <div className="min-h-screen bg-ondo-beige text-ondo-black overflow-x-hidden font-body">
      {/* Top Banner (ROJO BANNER) */}
      <div className="bg-ondo-red text-white py-2 text-xs md:text-sm font-bold tracking-wider uppercase font-title leading-none overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-flex w-[200%] justify-around">
          <span>{content.banner}</span>
          <span>{content.banner}</span>
        </div>
      </div>
      
      {/* Navbar (Crema Suave) */}
      <nav className="sticky top-0 z-30 bg-ondo-beige border-b border-black/5">
        <div className="w-full mx-auto px-6 py-5 md:py-7 flex items-center justify-between relative">
          <div className="flex items-center gap-8 hidden md:flex font-title font-semibold text-[15px] tracking-wide">
            <a href="#shop" className="hover:text-ondo-orange transition-colors">{content.navShop}</a>
            <a href="#split" className="hover:text-ondo-orange transition-colors">{content.navSubs}</a>
          </div>
          <div className="md:hidden">
            <Menu className="w-6 h-6 text-ondo-green" />
          </div>
          
          <a href="#" className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/images/Group 1597787.png" alt="ONDO Logo" className="h-[36px] md:h-[46px] object-contain" />
          </a>
        
        <div className="flex items-center gap-4 sm:gap-6">
           <div className="hidden md:flex gap-6 font-title font-semibold text-sm tracking-wide">
             <a href="#steps" className="hover:text-ondo-orange transition-colors">{content.navSteps}</a>
             <a href="#about" className="hover:text-ondo-orange transition-colors">{content.navAbout}</a>
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
               <p className="font-title uppercase tracking-widest text-lg">{content.emptyCart}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-50 items-center">
                <div className={`w-16 h-20 ${item.product.bgColor} rounded-xl overflow-hidden shrink-0`}>
                   <img src={item.product.image} className="w-full h-full object-cover mix-blend-multiply" alt="product" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                   <div className="flex justify-between gap-2 mb-2">
                      <h4 className="font-title font-bold text-[15px] leading-tight text-ondo-black pr-2">{item.product.title}</h4>
                      <div className="font-body font-semibold text-sm whitespace-nowrap text-right">
                         €{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                   </div>
                   <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-100 rounded-lg bg-ondo-white">
                         <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green rounded-l-lg transition-colors"><Minus className="w-3 h-3" /></button>
                         <span className="font-title text-[15px] w-6 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 px-3 text-ondo-black hover:bg-ondo-light-green rounded-r-lg transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-ondo-red transition-colors"><Trash2 className="w-5 h-5" /></button>
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
              <span className="font-title text-xl text-gray-500">{content.subtotal}</span>
              <span className="font-title text-[28px] font-bold text-ondo-black">€{cartSubtotal.toFixed(2)}</span>
            </div>
            <button className="w-full bg-ondo-orange hover:bg-ondo-light-green hover:text-ondo-black text-white font-title font-bold uppercase tracking-widest py-5 rounded-[14px] text-lg transition-colors shadow-md">
              {content.checkout}
            </button>
          </div>
        )}
      </div>
      
      {/* Hero Section (Fondo Principal: Crema Suave / Beige) */}
      <section 
        className="relative overflow-hidden flex items-center h-[calc(100vh-98px)]"
        style={{
          backgroundImage: "url('/images/ondo-104.JPG')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-ondo-beige/10 z-0 transition-opacity duration-300"></div>
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 py-16 h-full flex items-center">
          <div className="max-w-[420px] w-full bg-white p-8 md:p-10 flex flex-col justify-between shadow-sm min-h-[480px] md:min-h-[520px]">
            <h1 className="text-[52px] md:text-[60px] font-title leading-[0.95] tracking-wide mb-6 text-ondo-green uppercase">
              {content.heroTitle}
            </h1>
            <div>
              <p className="text-[17px] md:text-[19px] font-body mb-8 text-ondo-green leading-relaxed font-semibold">
                {content.heroSub}
              </p>
              <div>
                <button className="bg-transparent border-[3px] border-ondo-green text-ondo-green hover:bg-ondo-green hover:text-white font-title font-bold uppercase tracking-widest py-3 px-8 transition-colors text-[15px]">
                  {content.shopNow}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section (Fondo Alternativo: Blanco Humo) */}
      <section className="py-20 px-6 bg-ondo-white" id="shop">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
            
            {/* Sidebar Filters */}
            <div className="w-full md:w-1/4 xl:w-1/5 shrink-0 flex flex-col gap-4">
               <h3 className="font-title font-bold text-xl mb-2 text-ondo-black uppercase flex items-center justify-between">{content.filtersTitle}</h3>
               
               <button className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 font-title hover:border-ondo-green group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                 <div className="w-5 h-5 bg-ondo-green rounded flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Package className="w-3 h-3 text-white" /></div> 
                 {content.filterBundle}
               </button>
               
               <button className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 font-title hover:border-ondo-green group shadow-sm text-sm uppercase font-bold tracking-wide transition-colors w-full text-left">
                 <div className="w-5 h-5 bg-ondo-orange rounded flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform"><span className="text-[10px]">★</span></div> 
                 {content.filterNew}
               </button>
               
               <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 rounded-2xl border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-green group w-full text-left">
                 <div className="w-5 h-5 bg-ondo-yellow rounded flex items-center justify-center text-ondo-orange shrink-0 group-hover:scale-110 transition-transform"><span className="text-[12px]">♥</span></div> 
                 {content.filterBestseller}
               </button>

               <button className="flex items-center gap-3 bg-white text-ondo-black px-5 py-3 rounded-2xl border border-gray-100 font-title shadow-sm text-sm uppercase font-bold tracking-wide transition-colors hover:border-ondo-green group w-full text-left">
                 <div className="w-5 h-5 bg-ondo-light-green rounded flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform"><span className="text-[12px]">🌿</span></div> 
                 {content.filterVegan}
               </button>

               <div className="mt-4 flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 font-title font-bold shadow-sm text-sm uppercase tracking-wide cursor-pointer hover:border-ondo-green hover:text-ondo-green transition-colors w-full justify-between">
                 {content.sortBy} <ChevronRight className="w-4 h-4 rotate-90" />
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
                      {content.subscribeTab}
                    </button>
                    <button 
                      onClick={() => setPurchaseMode('single')}
                      className={`relative z-10 px-6 py-2 rounded-full font-title text-[13px] font-bold uppercase tracking-wide transition-colors ${purchaseMode === 'single' ? 'text-white' : 'text-gray-400 hover:text-ondo-black'}`}
                    >
                      {content.singleTab}
                    </button>
                 </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col group transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 p-4">
                    
                    {/* Hover Image Area */}
                    <div className={`w-full aspect-[4/3] ${product.bgColor} rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center p-6 cursor-pointer`}>
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-100 transition-opacity duration-300 group-hover:opacity-0" 
                      />
                      <img 
                        src={product.hoverImage} 
                        alt={`${product.title} hover`} 
                        className="w-full h-full object-cover mix-blend-multiply drop-shadow-md absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 scale-105 group-hover:scale-100" 
                      />
                    </div>

                    <div className="flex flex-col flex-1 px-2">
                      <div className="flex items-center text-ondo-yellow text-[11px] mb-2 tracking-widest">
                        ★★★★★ <span className="text-gray-300 font-body tracking-normal ml-2 underline underline-offset-2">(42)</span>
                      </div>
                      <h3 className="font-title text-[20px] font-bold mb-2 leading-[1.15] text-ondo-black line-clamp-2 uppercase">{product.title}</h3>
                      <div className="font-body text-ondo-green font-bold mb-5 text-[16px]">€{product.price.toFixed(2)}</div>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between w-full border border-gray-200 rounded-xl bg-ondo-white overflow-hidden text-ondo-black shadow-sm">
                          <button 
                            onClick={() => {
                              const productInCart = cart.find(item => item.product.id === product.id);
                              if (productInCart && productInCart.quantity > 0) {
                                updateQuantity(product.id, -1);
                              }
                            }} 
                            className={`p-3.5 transition-colors w-1/3 flex justify-center ${cart.find(item => item.product.id === product.id)?.quantity ? 'hover:bg-ondo-light-green text-ondo-black cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="font-title text-[15px] font-bold w-1/3 text-center">
                            {cart.find(item => item.product.id === product.id)?.quantity || 0}
                          </span>
                          
                          <button 
                            onClick={() => addToCart(product)} 
                            className="p-3.5 hover:bg-ondo-light-green hover:text-ondo-black transition-colors w-1/3 flex justify-center cursor-pointer text-ondo-black"
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
          <span>{content.midBanner}</span>
          <span>{content.midBanner}</span>
        </div>
      </div>

      {/* Split Section (Seccion Destacada: Amarillo) */}
      <section id="split" className="grid lg:grid-cols-2 bg-ondo-yellow min-h-[500px] lg:h-[90vh] lg:max-h-[90vh] border-y border-black/5 overflow-hidden">
        <div className="relative overflow-hidden w-full h-full min-h-[350px]">
           <img src="/images/ondo-065.JPG" alt="Subscription Box" className="w-full h-full object-cover" />
           <div className="absolute top-6 right-6 md:top-12 md:right-12 w-32 h-32 md:w-[150px] md:h-[150px] bg-ondo-black text-white rounded-full flex flex-col items-center justify-center -rotate-12 shadow-2xl border-4 border-ondo-yellow group hover:rotate-[-5deg] transition-transform duration-500">
             <span className="font-title text-3xl md:text-[44px] font-bold leading-none mb-1 text-ondo-orange">20%</span>
             <span className="font-title text-xl md:text-[32px] font-bold leading-none uppercase">OFF</span>
           </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-ondo-yellow">
          <h2 className="text-[44px] md:text-[60px] font-title font-bold mb-5 text-ondo-black uppercase leading-[1.05] tracking-tight whitespace-pre-line">{content.splitTitle}</h2>
          <p className="font-body text-[20px] mb-10 text-ondo-black/70 font-medium tracking-wide">{content.splitSub}</p>
          <button className="bg-ondo-orange hover:bg-ondo-light-green text-white hover:text-ondo-black font-title font-bold uppercase tracking-widest py-4 px-14 rounded-full transition-colors text-lg mb-6 shadow-md hover:-translate-y-1 transform duration-200">
            {content.subscribeSave}
          </button>
          <p className="font-body text-[15px] font-bold text-ondo-green">{content.offLife}</p>
        </div>
      </section>

      {/* Steps Section (Fondo Alternativo: Blanco Humo) */}
      <section id="steps" className="py-28 px-6 bg-ondo-white border-b border-gray-100">
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

      {/* Best Sellers Section */}
      <section id="best-sellers" className="py-24 px-6 bg-[#f8f5df] text-ondo-black text-center min-h-[600px] flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-[36px] md:text-[44px] font-title font-bold mb-16 uppercase tracking-wide text-ondo-black">
            {content.bestSellersTitle}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
            {mockProductsSingle.slice(0, 4).map((product, idx) => {
              const reviewCounts = [7462, 8346, 1464, 4123];
              return (
                <div key={product.id} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-full aspect-[4/5] bg-ondo-white rounded-xl mb-6 overflow-hidden relative shadow-md group-hover:shadow-2xl transition-shadow duration-300 flex items-center justify-center p-4">
                    <img src={product.image} alt={product.title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex gap-1 text-[#f5a623] text-lg mb-2">★★★★★</div>
                  <p className="font-title text-gray-500 text-[13px] font-semibold mb-2">{reviewCounts[idx].toLocaleString()} {content.reviews}</p>
                  <h3 className={`font-title text-[14px] md:text-[16px] font-bold uppercase tracking-wider px-2 text-center leading-snug
                    ${idx === 1 ? 'text-ondo-red' : 'text-ondo-black'}`}
                  >
                    {product.title.split('-')[0].trim()}
                  </h3>
                </div>
              );
            })}
          </div>

          <button className="bg-ondo-red hover:bg-ondo-orange text-white font-title font-bold uppercase tracking-widest py-4 px-12 rounded-full transition-all text-[15px] shadow-sm transform hover:-translate-y-0.5">
            {content.shopBestSellers}
          </button>
        </div>
      </section>

      {/* Footer (Negro Carbón) */}
      <footer className="bg-ondo-black text-ondo-white py-16 px-6 border-t-[16px] border-ondo-green">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="text-[40px] md:text-[52px] font-title font-bold text-ondo-white uppercase tracking-tighter">
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
    </div>
  );
}
