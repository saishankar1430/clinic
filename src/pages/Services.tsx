import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Baby, 
  FlameKindling,
  User,
  Heart,
  CornerDownRight,
  Smile,
  ShieldAlert
} from 'lucide-react';

interface FullService {
  id: string;
  name: string;
  image: string;
  description: string;
  duration: number; // minutes
  cost: string;
  benefits: string[];
  recovery: string;
  category: 'general' | 'cosmetic' | 'restorative' | 'pediatric';
}

export const Services: React.FC = () => {
  const navigate = useNavigate();

  const services: FullService[] = [
    {
      id: 'teeth-cleaning',
      name: 'Teeth Cleaning & Scaling',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600',
      description: 'Professional plaque, tartar and stain removal followed by advanced tooth polishing to prevent periodontal diseases.',
      duration: 30,
      cost: '$60 - $120',
      benefits: ['Stops bleeding gums', 'Eliminates persistent bad breath', 'Removes coffee/tea stains', 'Prevents cavities'],
      recovery: 'Immediate (No downtime)',
      category: 'general'
    },
    {
      id: 'root-canal',
      name: 'Root Canal Therapy',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
      description: 'Painless microscopic treatment to remove infected pulp inside the root canals and seal the tooth permanently.',
      duration: 60,
      cost: '$350 - $700',
      benefits: ['Stops excruciating pulp pain', 'Saves the decaying physical tooth', 'Prevents abscess formation'],
      recovery: '1 - 2 days (Mild post-treatment soreness)',
      category: 'restorative'
    },
    {
      id: 'braces',
      name: 'Orthodontic Braces & Aligners',
      image: 'https://images.unsplash.com/photo-1513412583491-0d13dd97bd01?auto=format&fit=crop&q=80&w=600',
      description: 'Custom ceramic, metallic braces or premium invisible aligners to correct malocclusions, crowded teeth, and bite issues.',
      duration: 45,
      cost: '$2,000 - $4,500',
      benefits: ['Resolves chewing difficulties', 'Perfects dental alignment', 'Drastically boosts self-confidence'],
      recovery: '2 - 3 days of adaptation after adjustments',
      category: 'cosmetic'
    },
    {
      id: 'dental-implants',
      name: 'Titanium Dental Implants',
      image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=600',
      description: 'Premium permanent titanium posts implanted into the jawbone to serve as a rock-solid root for custom porcelain crowns.',
      duration: 90,
      cost: '$1,500 - $3,000',
      benefits: ['Functions exactly like a real tooth', 'Prevents long-term jawbone resorption', 'Restores natural speech'],
      recovery: '3 - 7 days (Minor localized swelling)',
      category: 'restorative'
    },
    {
      id: 'tooth-extraction',
      name: 'Tooth Extraction (Surgical & Simple)',
      image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=600',
      description: 'Sterile and safe extraction of damaged, severely decayed, or impacted third molars (wisdom teeth) with absolute numbness.',
      duration: 40,
      cost: '$100 - $250',
      benefits: ['Halts localized infection spread', 'Relieves overcrowding', 'Prepares mouth for orthodontic work'],
      recovery: '2 - 4 days (Requires soft-food diet)',
      category: 'general'
    },
    {
      id: 'smile-makeover',
      name: 'Full Smile Makeover',
      image: 'https://images.unsplash.com/photo-1513628253939-0104a1c6de74?auto=format&fit=crop&q=80&w=600',
      description: 'A comprehensive, fully customized cosmetic overhaul combining veneers, crowns, whitening, and gum contouring.',
      duration: 120,
      cost: '$2,500 - $5,500',
      benefits: ['Designed around facial symmetry', 'Lifts dental staining', 'Gives a flawless celebrity-like smile'],
      recovery: '3 - 5 days (Veneer adaptation period)',
      category: 'cosmetic'
    },
    {
      id: 'cosmetic-dentistry',
      name: 'Cosmetic Veneers & Bonding',
      image: 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600',
      description: 'Ultra-thin, custom porcelain or composite shells bonded to the front of teeth to hide chips, gaps, or severe stains.',
      duration: 60,
      cost: '$400 - $800',
      benefits: ['Fixes minor tooth chips instantly', 'Fills unpleasant tooth gaps', 'Highly stain-resistant porcelain'],
      recovery: 'None',
      category: 'cosmetic'
    },
    {
      id: 'teeth-whitening',
      name: 'Laser Teeth Whitening',
      image: 'https://images.unsplash.com/photo-1447452001602-7fe93c7a3158?auto=format&fit=crop&q=80&w=600',
      description: 'Advanced in-office professional whitening system using premium whitening gel activated by specialized dental laser.',
      duration: 45,
      cost: '$150 - $300',
      benefits: ['Brightens teeth up to 8 shades', 'Painless and completely safe', 'Visible results in a single session'],
      recovery: 'None (Mild hot/cold sensitivity for 12 hours)',
      category: 'cosmetic'
    },
    {
      id: 'pediatric-dentistry',
      name: 'Pediatric Dentistry (Kids Care)',
      image: 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600',
      description: 'Gentle preventative care, fluoride sealants, and primary tooth treatment designed to be engaging and fun for children.',
      duration: 30,
      cost: '$50 - $110',
      benefits: ['Ensures healthy permanent teeth growth', 'Prevents dental phobias early', 'Fun learning on oral hygiene'],
      recovery: 'None',
      category: 'pediatric'
    },
    {
      id: 'dentures',
      name: 'Premium Complete & Partial Dentures',
      image: 'https://images.unsplash.com/photo-1513628253939-0104a1c6de74?auto=format&fit=crop&q=80&w=600',
      description: 'Custom removable prostheses utilizing comfortable medical-grade resins and natural acrylic teeth for geriatric care.',
      duration: 60,
      cost: '$600 - $1,200',
      benefits: ['Restores chewing and digestive health', 'Supports facial muscles', 'Cost-effective tooth replacement'],
      recovery: '1 - 2 weeks (Adjustment period for speech)',
      category: 'restorative'
    },
    {
      id: 'crowns',
      name: 'Porcelain & Zirconia Crowns',
      image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=600',
      description: 'Custom tooth caps made of zirconium or porcelain to reinforce fractured teeth or complete root canal processes.',
      duration: 45,
      cost: '$250 - $550',
      benefits: ['Reinforces structurally weak teeth', 'Completely bio-compatible', 'Custom-shaded to match adjacent teeth'],
      recovery: 'None (Immediate use allowed)',
      category: 'restorative'
    },
    {
      id: 'bridges',
      name: 'Fixed Dental Bridges',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
      description: 'Non-removable restorations that anchor onto adjacent healthy teeth to bridge gaps caused by missing teeth.',
      duration: 50,
      cost: '$500 - $1,000',
      benefits: ['Fills missing gaps permanently', 'Prevents shifting of neighboring teeth', 'Provides stellar stability'],
      recovery: '1 - 2 days (Mild gum sensitivity)',
      category: 'restorative'
    },
    {
      id: 'gum-treatment',
      name: 'Laser Periodontal Gum Treatment',
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600',
      description: 'Deep root planing and non-surgical laser cleaning to eliminate periodontal pockets and heal receding gum layers.',
      duration: 45,
      cost: '$150 - $400',
      benefits: ['Halts receding gum lines', 'Prevents tooth loosening', 'Sterilizes deep gum pockets'],
      recovery: '1 day (Avoid extremely hot/spicy food)',
      category: 'general'
    }
  ];

  const handleBookClick = (serviceId: string) => {
    navigate(`/book?service=${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      
      {/* Header Summary */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-12 md:py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Our Dental Services</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Dr. Mahesh provides premium treatment across 13 core specializations. Browse costs, benefits, durations, and book online instantly.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Header */}
              <div className="h-48 relative bg-slate-100">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3.5 left-3.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow backdrop-blur">
                  {service.category}
                </span>
              </div>

              {/* Service Details */}
              <div className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {service.description}
                </p>

                {/* Treatment details */}
                <div className="grid grid-cols-2 gap-2 border-y border-slate-100 dark:border-slate-800 py-3 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Duration: <strong className="text-slate-700 dark:text-slate-200">{service.duration}m</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cost: <strong className="text-slate-700 dark:text-slate-200">{service.cost}</strong></span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Benefits</h4>
                  <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {service.benefits.map((b, i) => (
                      <li key={i} className="flex gap-1.5 items-start">
                        <CornerDownRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Book Button */}
            <div className="px-6 pb-6 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-[10px] text-slate-400 leading-tight">
                Recovery: <strong className="text-slate-600 dark:text-slate-200 block">{service.recovery}</strong>
              </span>
              <button
                onClick={() => handleBookClick(service.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-full transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book This</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
