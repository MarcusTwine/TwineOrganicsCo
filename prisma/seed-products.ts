import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const db = new PrismaClient({ adapter })

const categories = [
  { name: 'Tallow Balm', slug: 'tallow-balm' },
  { name: 'Tallow Face Balm', slug: 'tallow-face-balm' },
  { name: 'Tallow Soap', slug: 'tallow-soap' },
  { name: 'Tallow Deodorant', slug: 'tallow-deodorant' },
  { name: 'Tallow Candles', slug: 'tallow-candles' },
  { name: 'Tallow Sunblock', slug: 'tallow-sunblock' },
  { name: 'Tallow Lip Balm', slug: 'tallow-lip-balm' },
  { name: 'Tallow Face Cleanser', slug: 'tallow-face-cleanser' },
  { name: 'Tallow Baby Balm', slug: 'tallow-baby-balm' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Bundles', slug: 'bundles' },
  { name: 'Home And Bath', slug: 'home-and-bath' },
]

type ProductDef = {
  name: string
  slug: string
  description: string
  price: number
  stock: number
  images: string[]
  tags: string[]
  isFeatured: boolean
  categorySlug: string
}

const products: ProductDef[] = [
  // ─── Tallow Balm ─────────────────────────────────────────────────────────────
  {
    name: 'Tallow Balm - Frankincense',
    slug: 'tallow-frankincense-balm',
    description:
      'A wholesome tallow body moisturiser formulated with clean ingredients designed for deep skin absorption. Grass-fed beef tallow shares approximately 55% saturated fat composition with human sebum, allowing full absorption without greasy residue. Enriched with organic frankincense essential oil for its astringent properties that heal and restore skin cell tone, reduce the appearance of wrinkles, and combat loss of firmness. Cold-pressed virgin olive oil adds vitamin E, antioxidants, and squalene for anti-aging and skin repair. Available in whipped and un-whipped textures.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, organic frankincense essential oil.',
    price: 285.0,
    stock: 30,
    images: ['/uploads/products/frank-tallow-balm-200-3.jpg'],
    tags: ['tallow', 'balm', 'frankincense', 'moisturiser', 'body-care', 'natural'],
    isFeatured: true,
    categorySlug: 'tallow-balm',
  },
  {
    name: 'Tallow Balm - Bergamot & Vanilla',
    slug: 'tallow-burgamot-vanilla-balm',
    description:
      'A luxurious tallow body moisturiser blending the citrusy sweetness of bergamot with warm vanilla. Grass-fed beef tallow is highly compatible with human skin oil — both share approximately 55% saturated fats — absorbing fully without greasy residue. Rich in vitamins A, D, K, and E, this balm nourishes and protects. Bergamot adds antibacterial and anti-inflammatory benefits, while vanilla contributes antioxidants and a mild antimicrobial effect. Available in whipped and un-whipped textures.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, organic bergamot essential oil, vanilla pod infusion.',
    price: 285.0,
    stock: 25,
    images: ['/uploads/products/bergamot-vanilla-200-3.jpg'],
    tags: ['tallow', 'balm', 'bergamot', 'vanilla', 'moisturiser', 'body-care', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-balm',
  },
  {
    name: 'Tallow Balm - Rose & Sandalwood',
    slug: 'tallow-rose-sandalwood-balm',
    description:
      'An indulgent tallow body balm with a beautiful heart of rose and dark musk sandalwood. Grass-fed beef tallow provides deep, non-greasy nourishment — its saturated fat profile mirrors human sebum for optimal skin compatibility. Packed with vitamins A, D, K, and E. Rose essential oil is renowned for its skin-rejuvenating and anti-inflammatory properties, while sandalwood adds a grounding, woody warmth and helps soothe dry skin. Available in whipped and un-whipped textures.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, rose & sandalwood essential oils.',
    price: 285.0,
    stock: 20,
    images: ['/uploads/products/rose-sandalwood-balm200-1.jpg'],
    tags: ['tallow', 'balm', 'rose', 'sandalwood', 'moisturiser', 'body-care', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-balm',
  },
  {
    name: 'Tallow Balm - Unscented',
    slug: 'tallow-unscented-balm',
    description:
      'A pure, fragrance-free tallow body moisturiser made with clean ingredients only. Grass-fed beef tallow is highly absorbable and rich in vitamins A, D, K, and E. Its chemical composition mirrors human sebum — the single most compatible ingredient for skin absorption without greasy residue. Cold-pressed virgin olive oil adds vitamin E, antioxidants, squalene, and oleocanthal for skin repair. Perfect for those with fragrance sensitivities or very sensitive skin. Available in whipped and un-whipped textures, and in multiple sizes including a 1000ml bulk option.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil.',
    price: 275.0,
    stock: 35,
    images: ['/uploads/products/Tallow-balm-200-3.jpg'],
    tags: ['tallow', 'balm', 'unscented', 'sensitive-skin', 'moisturiser', 'body-care', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-balm',
  },
  {
    name: 'Comfrey Healing Balm',
    slug: 'tallow-comfrey-balm',
    description:
      'A targeted healing balm combining the regenerative power of comfrey with nutrient-dense grass-fed beef tallow. Comfrey (Symphytum officinale) has been used for centuries to support skin repair, reduce inflammation, and soothe irritation. Tallow provides the perfect carrier — deeply absorbable, rich in vitamins A, D, K, and E, and fully compatible with human skin oils. Ideal for dry patches, minor wounds, cracked skin, and areas that need extra care.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, organic comfrey extract.',
    price: 195.0,
    stock: 20,
    images: ['/uploads/products/confrey-balm-100-1.jpg'],
    tags: ['tallow', 'balm', 'comfrey', 'healing', 'skin-repair', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-balm',
  },

  // ─── Tallow Face Balm ─────────────────────────────────────────────────────────
  {
    name: 'Tallow Face Balm - Frankincense',
    slug: 'tallow-frankincense-face-balm',
    description:
      'A rich facial balm harnessing the astringent and restorative properties of organic frankincense essential oil. Grass-fed beef tallow serves as the ideal base — its composition closely mirrors human sebum, allowing it to absorb seamlessly into facial skin without clogging pores or leaving residue. Frankincense helps restore skin cell tone, reduce the appearance of fine lines and wrinkles, and combat loss of firmness. Cold-pressed virgin olive oil contributes antioxidants, vitamin E, and squalene.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, organic frankincense essential oil.',
    price: 275.0,
    stock: 20,
    images: ['/uploads/products/frank-tallow-balm-100-1.jpg'],
    tags: ['tallow', 'face-balm', 'frankincense', 'anti-aging', 'facial-care', 'natural'],
    isFeatured: true,
    categorySlug: 'tallow-face-balm',
  },
  {
    name: 'Tallow Face Balm - Bergamot & Vanilla',
    slug: 'tallow-face-balm-bergamot-vanilla',
    description:
      'A nourishing facial balm blending the antibacterial properties of bergamot with the antioxidant richness of vanilla. Grass-fed beef tallow is deeply compatible with skin oils, absorbing without greasiness while delivering vitamins A, D, K, and E. Bergamot soothes inflammation and supports clear skin, while vanilla provides a warm, comforting scent and mild antimicrobial action. Ideal for daily facial moisturising.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil, organic bergamot essential oil, vanilla pod infusion.',
    price: 275.0,
    stock: 15,
    images: ['/uploads/products/DSC3329_d397b474-1b12-4e96-b3aa-bd2456cbaf36.jpg'],
    tags: ['tallow', 'face-balm', 'bergamot', 'vanilla', 'facial-care', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-face-balm',
  },
  {
    name: 'Tallow Face Balm - Unscented',
    slug: 'tallow-face-balm-unscented',
    description:
      'A pure, fragrance-free facial moisturiser for sensitive or reactive skin. Grass-fed beef tallow is among the most biocompatible ingredients for human skin — its saturated fat profile closely mirrors sebum, enabling it to absorb deeply without greasy residue or pore-clogging. Rich in fat-soluble vitamins A, D, K, and E. Cold-pressed virgin olive oil adds antioxidants and skin-repair compounds. Free from synthetic fragrances, making it ideal for those prone to irritation or breakouts.\n\nIngredients: Grass-fed beef tallow, cold-pressed virgin olive oil.',
    price: 275.0,
    stock: 25,
    images: ['/uploads/products/unscented-face-balm.jpg'],
    tags: ['tallow', 'face-balm', 'unscented', 'sensitive-skin', 'facial-care', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-face-balm',
  },

  // ─── Tallow Soap ─────────────────────────────────────────────────────────────
  {
    name: 'Tallow Soap - Rose Geranium',
    slug: 'tallow-soap-rose-geranium',
    description:
      'A handmade tallow soap crafted in small batches, ideal for a wide range of skin concerns. Whether you struggle with acne, eczema, fungal infections, rashes, or dermatitis, the soothing properties of rose geranium essential oil can provide meaningful relief. Free from harsh chemicals, palm oil, artificial fragrances, colorants, SLS, and parabens. Suitable for dry and sensitive skin, including babies. Each bar weighs approximately 110g.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, kaolin clay, rose geranium essential oil.',
    price: 75.0,
    stock: 50,
    images: ['/uploads/products/Rose_geranium_soap-1_f8aa77ef-a6e8-4051-9cc7-eae3223a6eb6.jpg'],
    tags: ['tallow', 'soap', 'rose-geranium', 'sensitive-skin', 'handmade', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap - Charcoal Lemongrass',
    slug: 'tallow-soap-charcoal-lemongrass',
    description:
      'A deep-cleansing handmade tallow soap combining the purifying power of activated charcoal with the fresh, citrusy brightness of lemongrass. Activated charcoal draws out impurities and excess oil, while lemongrass essential oil provides antibacterial and antifungal benefits. Grass-fed beef tallow ensures the bar stays moisturising and gentle on skin. Free from palm oil, SLS, parabens, and artificial fragrances. Hand-poured in small batches. Each bar weighs approximately 110g.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, activated charcoal, lemongrass essential oil.',
    price: 75.0,
    stock: 45,
    images: ['/uploads/products/charcoal_lemongrass_soap-1_2.jpg'],
    tags: ['tallow', 'soap', 'charcoal', 'lemongrass', 'deep-cleanse', 'handmade', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap - Rooibos Honey',
    slug: 'tallow-soap-rooibos-honey',
    description:
      'A uniquely South African handmade tallow soap infused with antioxidant-rich rooibos and soothing raw honey. Rooibos is celebrated for its anti-inflammatory, antimicrobial, and skin-calming properties, while honey is a natural humectant that draws moisture into the skin. Grass-fed beef tallow keeps the bar rich and creamy. Free from palm oil, SLS, parabens, and synthetic fragrances. Hand-poured in small batches. Each bar weighs approximately 110g.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, rooibos extract, raw honey.',
    price: 75.0,
    stock: 40,
    images: ['/uploads/products/DSD_5687.jpg'],
    tags: ['tallow', 'soap', 'rooibos', 'honey', 'moisturising', 'handmade', 'natural', 'south-african'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap - Unscented',
    slug: 'tallow-soap-unscented',
    description:
      'A gentle, fragrance-free handmade tallow soap for sensitive and reactive skin. Formulated with the simplest, cleanest ingredients — no essential oils, no artificial fragrances, no harsh chemicals. Grass-fed beef tallow creates a rich, moisturising lather while keeping skin balanced and calm. Suitable for babies, those with allergies, and anyone who prefers unscented products. Hand-poured in small batches. Each bar weighs approximately 110g.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow.',
    price: 75.0,
    stock: 40,
    images: ['/uploads/products/IMG_0203_7a63f308-3d15-4a14-b7d8-a544798d7811.jpg'],
    tags: ['tallow', 'soap', 'unscented', 'sensitive-skin', 'baby-safe', 'handmade', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap Bulk Bundle - Charcoal Lemongrass',
    slug: 'tallow-soap-bulk-bundle',
    description:
      'Stock up and save with a bulk bundle of our deep-cleansing Charcoal Lemongrass tallow soap. Each bar is handmade in small batches using activated charcoal, lemongrass essential oil, and nourishing grass-fed beef tallow. Perfect for households, gifting, or those who simply love this bar and want more. Free from palm oil, SLS, parabens, and artificial fragrances.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, activated charcoal, lemongrass essential oil.',
    price: 265.0,
    stock: 20,
    images: ['/uploads/products/DSC_0969.jpg'],
    tags: ['tallow', 'soap', 'charcoal', 'lemongrass', 'bulk', 'value', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap Bulk Bundle - Rooibos Honey',
    slug: 'tallow-soap-bulk-bundle-rooibos-honey-1',
    description:
      'Stock up and save with a bulk bundle of our beloved Rooibos Honey tallow soap. Infused with antioxidant-rich rooibos and soothing raw honey, these bars are a proudly South African take on natural skincare. Handmade in small batches with grass-fed beef tallow. Free from palm oil, SLS, parabens, and synthetic fragrances.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, rooibos extract, raw honey.',
    price: 265.0,
    stock: 20,
    images: ['/uploads/products/DSC_1004.jpg'],
    tags: ['tallow', 'soap', 'rooibos', 'honey', 'bulk', 'value', 'natural', 'south-african'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap Bulk Bundle - Rose Geranium',
    slug: 'tallow-soap-bulk-bundle-rose-geranium',
    description:
      'Stock up and save with a bulk bundle of our Rose Geranium tallow soap. Ideal for sensitive and troubled skin — including acne, eczema, and dermatitis — this handmade bar pairs rose geranium essential oil with nourishing grass-fed beef tallow. Free from palm oil, SLS, parabens, and artificial fragrances.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow, kaolin clay, rose geranium essential oil.',
    price: 265.0,
    stock: 15,
    images: ['/uploads/products/DSC_0887.jpg'],
    tags: ['tallow', 'soap', 'rose-geranium', 'bulk', 'sensitive-skin', 'value', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },
  {
    name: 'Tallow Soap Bulk Bundle - Unscented',
    slug: 'tallow-soap-bulk-bundle-unscented-1',
    description:
      'Stock up and save with a bulk bundle of our pure, fragrance-free Unscented tallow soap. The gentlest option in our soap range — no essential oils, no fragrances, no additives. Perfect for sensitive skin, babies, or anyone who wants the cleanest possible bar. Handmade in small batches with grass-fed beef tallow.\n\nIngredients: Extra virgin olive oil, coconut oil, water, 100% grass-fed beef tallow.',
    price: 265.0,
    stock: 15,
    images: ['/uploads/products/DSC_0816.jpg'],
    tags: ['tallow', 'soap', 'unscented', 'bulk', 'sensitive-skin', 'baby-safe', 'value', 'natural'],
    isFeatured: false,
    categorySlug: 'tallow-soap',
  },

  // ─── Tallow Deodorant ─────────────────────────────────────────────────────────
  {
    name: 'Tallow Deodorant - Bergamot And Vanilla',
    slug: 'tallow-deodorant-bergamont-and-vanilla',
    description:
      'A natural deodorant that actually works — without bicarbonate of soda or aluminium. Grass-fed beef tallow forms the base, chosen for its compatibility with human skin sebum. Organic arrowroot absorbs moisture, magnesium hydroxide neutralises odour-causing bacteria while preserving skin pH, and candelilla wax provides texture. Bergamot offers antibacterial and anti-inflammatory benefits; vanilla contributes antioxidants and mild antimicrobial action. Effective all day with a subtle, pleasant scent. Suitable for sensitive skin.\n\nIngredients: Grass-fed beef tallow, organic virgin coconut oil, organic arrowroot, magnesium hydroxide, candelilla wax, bergamot essential oil, vanilla pod infusion.',
    price: 265.0,
    stock: 20,
    images: ['/uploads/products/DSC3318.jpg'],
    tags: ['tallow', 'deodorant', 'bergamot', 'vanilla', 'natural', 'aluminium-free', 'sensitive-skin'],
    isFeatured: true,
    categorySlug: 'tallow-deodorant',
  },
  {
    name: 'Tallow Deodorant - Floral Harmony',
    slug: 'tallow-deodorant-floral-harmony',
    description:
      'A natural deodorant with a beautifully balanced floral scent — free from bicarbonate of soda and aluminium. The same effective, skin-friendly formula as our other deodorants: grass-fed beef tallow for skin compatibility, organic arrowroot for moisture absorption, magnesium hydroxide to neutralise odour, and candelilla wax for texture. Floral Harmony offers a gentle, feminine fragrance that stays subtle throughout the day. Suitable for sensitive skin.\n\nIngredients: Grass-fed beef tallow, organic virgin coconut oil, organic arrowroot, magnesium hydroxide, candelilla wax, floral essential oil blend.',
    price: 265.0,
    stock: 20,
    images: ['/uploads/products/IMG_0211.jpg'],
    tags: ['tallow', 'deodorant', 'floral', 'natural', 'aluminium-free', 'sensitive-skin'],
    isFeatured: false,
    categorySlug: 'tallow-deodorant',
  },
  {
    name: 'Tallow Deodorant - Tea Tree And Lemongrass',
    slug: 'tallow-deodorant-tea-tree-and-lemongrass',
    description:
      'A powerfully antibacterial natural deodorant combining the cleansing strength of tea tree with the fresh, citrusy lift of lemongrass. Free from bicarbonate of soda and aluminium. Tea tree oil is one of nature\'s most effective antimicrobial agents, making this variant especially potent at neutralising odour at the source. Magnesium hydroxide further manages bacteria while preserving skin pH. Organic arrowroot keeps you dry. Suitable for sensitive skin.\n\nIngredients: Grass-fed beef tallow, organic virgin coconut oil, organic arrowroot, magnesium hydroxide, candelilla wax, tea tree essential oil, lemongrass essential oil.',
    price: 265.0,
    stock: 20,
    images: ['/uploads/products/DSC3325_25e0503b-c5a2-4061-a677-6bd80c438134.jpg'],
    tags: ['tallow', 'deodorant', 'tea-tree', 'lemongrass', 'natural', 'aluminium-free', 'antibacterial'],
    isFeatured: false,
    categorySlug: 'tallow-deodorant',
  },

  // ─── Tallow Candles ──────────────────────────────────────────────────────────
  {
    name: 'Beeswax And Tallow Candle',
    slug: 'beeswax-and-tallow-candle',
    description:
      'Hand-poured, small-batch candles crafted with beeswax, grass-fed beef tallow, cotton core wicks, and the finest quality essential oils. These artisanal candles feature light, natural scents with no synthetic fragrances, paraffin, or toxic ingredients — just clean, slow-burning light. Each 200ml candle offers a 40+ hour burn time. Natural frosting and minor imperfections are part of their handmade character. Made in George, South Africa. Trim the cotton wick to 6mm before each use.\n\nAvailable scents: Bergamot & Vanilla, Rose & Sandalwood, Coffee.\n\nIngredients: Beeswax, grass-fed beef tallow, cotton core wicks, pure essential oils.',
    price: 295.0,
    stock: 15,
    images: ['/uploads/products/bergamot-candle-200-1.jpg'],
    tags: ['candle', 'beeswax', 'tallow', 'handmade', 'natural', 'south-african', 'home-decor'],
    isFeatured: true,
    categorySlug: 'tallow-candles',
  },

  // ─── Tallow Sunblock ─────────────────────────────────────────────────────────
  {
    name: 'Tallow Sunblock',
    slug: 'tallow-sunblock',
    description:
      'A natural sunscreen combining non-nano zinc oxide with the nourishing power of grass-fed beef tallow and botanical oils. Provides broad-spectrum protection against both UVA and UVB rays without synthetic chemicals. Non-nano zinc oxide creates a physical protective barrier, while tallow ensures deep skin compatibility and absorption. Extra-virgin olive oil delivers vitamin E and antioxidants; organic coconut oil adds anti-inflammatory and antibacterial properties; beeswax acts as a natural emulsifier. Suitable for everyday use and outdoor activities.\n\nIngredients: Cold-pressed virgin olive oil, non-nano zinc oxide, grass-fed beef tallow, organic virgin coconut oil, beeswax.',
    price: 265.0,
    stock: 25,
    images: ['/uploads/products/tallow-sunblock100-1.jpg'],
    tags: ['tallow', 'sunblock', 'sunscreen', 'zinc-oxide', 'natural', 'uv-protection', 'chemical-free'],
    isFeatured: true,
    categorySlug: 'tallow-sunblock',
  },

  // ─── Tallow Lip Balm ─────────────────────────────────────────────────────────
  {
    name: 'Tallow Lip Balm',
    slug: 'tallow-lip-balm',
    description:
      'A 100% natural lip balm offering lasting protection and deep moisture without petroleum or propylene glycol. Grass-fed beef tallow is prized for its compatibility with human skin — it retains moisture and nourishes without creating dependency. Beeswax locks in hydration and adds vitamins and minerals. Available in four scents: Ylang Ylang, Peppermint, Bergamot & Vanilla, and Rose & Vanilla. Can also be applied to soothe sunburned lips.\n\nIngredients: Grass-fed beef tallow, cold-pressed olive oil, beeswax, lanolin, essential oil blend (varies by scent).',
    price: 45.0,
    stock: 60,
    images: ['/uploads/products/lip_balm_group-1.jpg'],
    tags: ['tallow', 'lip-balm', 'natural', 'beeswax', 'moisturising', 'petroleum-free'],
    isFeatured: false,
    categorySlug: 'tallow-lip-balm',
  },

  // ─── Tallow Face Cleanser ─────────────────────────────────────────────────────
  {
    name: 'Tallow Face Oil Cleanser - Frankincense',
    slug: 'tallow-face-oil-cleanser-frankincense',
    description:
      'An oil cleanser that provides deep, thorough cleansing while preserving the skin\'s natural oil balance, promoting hydration and clarity. Gently dissolves and lifts away dirt, excess oil, sunscreen, and makeup. Grass-fed beef tallow mirrors human sebum composition for seamless absorption without residue. Organic jojoba oil mimics skin\'s natural oils; cold-pressed castor oil provides antimicrobial and anti-inflammatory benefits; frankincense essential oil helps restore skin tone and reduce the appearance of fine lines.\n\nUsage: Apply a pea-sized amount, massage for 30–60 seconds, rinse with warm water and a cloth, then moisturise. Keep water out of the container to prevent rancidity.\n\nIngredients: Grass-fed beef tallow, organic jojoba oil, cold-pressed castor oil, organic frankincense essential oil.',
    price: 295.0,
    stock: 20,
    images: ['/uploads/products/IMG_0194.jpg'],
    tags: ['tallow', 'face-cleanser', 'oil-cleanser', 'frankincense', 'facial-care', 'natural', 'makeup-remover'],
    isFeatured: false,
    categorySlug: 'tallow-face-cleanser',
  },

  // ─── Tallow Baby Balm ─────────────────────────────────────────────────────────
  {
    name: 'Baby Bum Balm',
    slug: 'baby-bum-balm',
    description:
      'An all-natural tallow balm formulated to provide soothing relief from diaper rash and skin irritation. Grass-fed beef tallow is among the most skin-compatible ingredients available — its saturated fat profile closely mirrors human sebum, allowing it to absorb fully without residue. Non-nano zinc oxide creates a protective barrier; bentonite clay helps detoxify; organic coconut oil deeply moisturises and reduces inflammation; beeswax seals and protects. Organic frankincense adds antimicrobial and healing benefits. Gentle enough for the most sensitive baby skin.\n\nIngredients: Grass-fed beef tallow, organic virgin coconut oil, non-nano zinc oxide, bentonite clay, cold-pressed virgin olive oil, beeswax, organic frankincense essential oil.',
    price: 245.0,
    stock: 30,
    images: ['/uploads/products/baby-100-1_24331f5f-7454-4d83-b9a8-83d13072bebd.jpg'],
    tags: ['tallow', 'baby', 'balm', 'diaper-rash', 'zinc-oxide', 'natural', 'sensitive-skin', 'baby-care'],
    isFeatured: false,
    categorySlug: 'tallow-baby-balm',
  },

  // ─── Clothing ─────────────────────────────────────────────────────────────────
  {
    name: 'Sweatshirt - My House',
    slug: 'sweatshirt-my-house',
    description:
      'A quality sweatshirt from Twine Organics Co, featuring the "My House" graphic. Crafted for comfort and durability, this piece reflects the brand\'s commitment to natural living and conscious consumption. A wearable statement of values.',
    price: 695.0,
    stock: 10,
    images: ['/uploads/products/DSC_1166.jpg'],
    tags: ['clothing', 'sweatshirt', 'apparel', 'lifestyle'],
    isFeatured: false,
    categorySlug: 'clothing',
  },

  // ─── Bundles ─────────────────────────────────────────────────────────────────
  {
    name: 'Baby Bundle',
    slug: 'baby-bundle',
    description:
      'A curated collection of Twine Organics Co\'s best baby products, bundled together for new parents and thoughtful gift-givers. Everything you need to keep baby\'s skin clean, nourished, and protected — naturally. Save compared to buying individual items.',
    price: 565.0,
    stock: 10,
    images: ['/uploads/products/DSC03419_4f674840-2b04-4183-bcc6-846bda49323d.jpg'],
    tags: ['bundle', 'baby', 'gift', 'natural', 'baby-care', 'value'],
    isFeatured: true,
    categorySlug: 'bundles',
  },
  {
    name: 'Facial Bundle',
    slug: 'facial-bundle',
    description:
      'A complete natural facial skincare collection from Twine Organics Co. Combines our best face balm, cleanser, and supporting products into one curated bundle. Everything needed for a clean, tallow-based facial routine that nourishes and protects without synthetic chemicals. Save compared to buying individual items.',
    price: 550.0,
    stock: 10,
    images: ['/uploads/products/DSC_0864.jpg'],
    tags: ['bundle', 'facial', 'skincare', 'gift', 'natural', 'value'],
    isFeatured: false,
    categorySlug: 'bundles',
  },
  {
    name: 'Summer Bundle - Bergamot & Vanilla',
    slug: 'summer-bundle-bergamot-vanilla',
    description:
      'A seasonal Twine Organics Co bundle built around the uplifting Bergamot & Vanilla scent. Includes a curated selection of our most-loved products in this warm, citrusy fragrance — perfect for gifting or treating yourself to a complete natural skincare routine. Save compared to buying individual items.',
    price: 795.0,
    stock: 8,
    images: ['/uploads/products/DSC_0826.jpg'],
    tags: ['bundle', 'bergamot', 'vanilla', 'summer', 'gift', 'natural', 'value'],
    isFeatured: false,
    categorySlug: 'bundles',
  },
  {
    name: 'Summer Bundle - Frankincense',
    slug: 'summer-bundle-frankincense',
    description:
      'A seasonal Twine Organics Co bundle centred on the grounding, restorative Frankincense scent. Includes a curated selection of our most-loved products in this earthy, anti-aging fragrance — perfect for gifting or building a complete natural skincare routine. Save compared to buying individual items.',
    price: 795.0,
    stock: 8,
    images: ['/uploads/products/DSC_0814.jpg'],
    tags: ['bundle', 'frankincense', 'summer', 'gift', 'natural', 'value'],
    isFeatured: false,
    categorySlug: 'bundles',
  },

  // ─── Home And Bath ────────────────────────────────────────────────────────────
  {
    name: 'Crochet Cotton Face Cloth',
    slug: 'crocheted-cotton-face-cloth-handmade-in-south-africa',
    description:
      'A handmade crocheted cotton face cloth, crafted in South Africa. The perfect companion to your tallow face balm or oil cleanser — gentle on skin and fully reusable. Made from 100% cotton for a soft, absorbent texture that won\'t irritate sensitive skin. An eco-conscious alternative to disposable wipes and cotton rounds.',
    price: 145.0,
    stock: 25,
    images: ['/uploads/products/DSC3333.jpg'],
    tags: ['face-cloth', 'handmade', 'cotton', 'eco-friendly', 'south-african', 'reusable', 'home-bath'],
    isFeatured: false,
    categorySlug: 'home-and-bath',
  },
]

async function main() {
  console.log('Upserting categories...')
  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const result = await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    })
    categoryMap[cat.slug] = result.id
    console.log(`  ✓ ${cat.name}`)
  }

  console.log('\nUpserting products...')
  let created = 0
  let updated = 0

  for (const p of products) {
    const categoryId = categoryMap[p.categorySlug]
    if (!categoryId) {
      console.warn(`  ⚠ No category found for slug "${p.categorySlug}", skipping "${p.name}"`)
      continue
    }

    const existing = await db.product.findUnique({ where: { slug: p.slug } })
    if (existing) {
      await db.product.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          images: p.images,
          tags: p.tags,
          isFeatured: p.isFeatured,
          categoryId,
        },
      })
      console.log(`  ↑ Updated: ${p.name}`)
      updated++
    } else {
      await db.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          stock: p.stock,
          images: p.images,
          tags: p.tags,
          isActive: true,
          isFeatured: p.isFeatured,
          categoryId,
        },
      })
      console.log(`  + Created: ${p.name}`)
      created++
    }
  }

  console.log(`\nDone. ${created} created, ${updated} updated.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
