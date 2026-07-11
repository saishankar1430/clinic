import { db } from './config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_SERVICES = [
  {
    id: 'teeth-cleaning',
    name: 'Teeth Cleaning',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600',
    description: 'Professional plaque removal, scaling, and polishing to maintain excellent oral hygiene and fresh breath.',
    duration: 30,
    estimatedCost: '$60 - $120',
    benefits: ['Prevents gum disease', 'Removes stains', 'Brightens smile', 'Eliminates bad breath'],
    recoveryTime: 'None (Immediate return to normal activities)'
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    description: 'Expert therapy to save a severely infected or decaying tooth, relieving persistent dental pain.',
    duration: 60,
    estimatedCost: '$350 - $700',
    benefits: ['Relieves tooth pain', 'Saves natural tooth', 'Prevents spread of infection', 'Restores chewing ability'],
    recoveryTime: '1 - 2 days (Mild sensitivity)'
  },
  {
    id: 'dental-implants',
    name: 'Dental Implants',
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=600',
    description: 'Premium permanent solution to replace missing teeth with natural-looking titanium posts and crowns.',
    duration: 90,
    estimatedCost: '$1,500 - $3,000',
    benefits: ['Looks and feels natural', 'Prevents bone loss', 'Durable and long-lasting', 'Improves facial structure'],
    recoveryTime: '3 - 7 days (Minor swelling)'
  },
  {
    id: 'braces',
    name: 'Orthodontic Braces',
    image: 'https://images.unsplash.com/photo-1513412583491-0d13dd97bd01?auto=format&fit=crop&q=80&w=600',
    description: 'Traditional metal and ceramic braces to align crooked teeth and fix bite issues for patients of all ages.',
    duration: 45,
    estimatedCost: '$2,000 - $4,500',
    benefits: ['Perfects tooth alignment', 'Improves bite and chewing', 'Boosts self-confidence', 'Prevents tooth wear'],
    recoveryTime: '2 - 3 days of mild discomfort after adjustment'
  },
  {
    id: 'teeth-whitening',
    name: 'Laser Teeth Whitening',
    image: 'https://images.unsplash.com/photo-1447452001602-7fe93c7a3158?auto=format&fit=crop&q=80&w=600',
    description: 'Advanced in-office professional whitening system to lift deep stains and brighten teeth by up to 8 shades.',
    duration: 45,
    estimatedCost: '$150 - $300',
    benefits: ['Instant visual results', 'Safe and painless', 'Removes deep tea/coffee stains', 'Boosts facial aesthetic'],
    recoveryTime: 'None (Temporary hot/cold sensitivity for 24h)'
  },
  {
    id: 'pediatric-dentistry',
    name: 'Pediatric Dentistry',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600',
    description: 'Gentle, fun, and specialized dental care designed exclusively for kids to build lifelong healthy dental habits.',
    duration: 30,
    estimatedCost: '$50 - $100',
    benefits: ['Kid-friendly environment', 'Protects baby teeth', 'Teaches proper brushing', 'Prevents dental anxiety'],
    recoveryTime: 'None'
  }
];

const DEFAULT_TIMINGS = [
  { day: 'Monday', open: '10:00 AM', close: '07:00 PM', isClosed: false },
  { day: 'Tuesday', open: '10:00 AM', close: '07:00 PM', isClosed: false },
  { day: 'Wednesday', open: '10:00 AM', close: '07:00 PM', isClosed: false },
  { day: 'Thursday', open: '10:00 AM', close: '07:00 PM', isClosed: false },
  { day: 'Friday', open: '10:00 AM', close: '07:00 PM', isClosed: false },
  { day: 'Saturday', open: '10:00 AM', close: '05:00 PM', isClosed: false },
  { day: 'Sunday', open: '00:00 AM', close: '00:00 AM', isClosed: true }
];

const DEFAULT_FAQS = [
  { id: '1', question: 'Do I need to book an appointment before visiting Dr. Mahesh?', answer: 'Yes, we highly recommend booking an appointment online. This ensures Dr. Mahesh is present, and minimizes your wait time at the clinic. Check our "Before You Leave Home" live availability indicator on the homepage before starting your journey!', category: 'General' },
  { id: '2', question: 'What is the "Before You Leave Home" live status?', answer: 'This is a real-time status updated directly by Dr. Mahesh herself. It tells you if she is available, out for lunch, on vacation, or handling an emergency. This saves you from traveling to the clinic only to find the doctor is away.', category: 'Appointments' },
  { id: '3', question: 'How often should I get my teeth cleaned?', answer: 'We recommend visiting us for a professional scale and polish every 6 months. This helps prevent plaque buildup, cavities, and gum diseases.', category: 'Dental Care' },
  { id: '4', question: 'What options do I have for replacing a missing tooth?', answer: 'We offer premium Dental Implants, Bridges, and complete/partial Dentures. Dr. Mahesh will assess your bone density and medical history to suggest the most appropriate treatment during your consultation.', category: 'Treatments' }
];

const DEFAULT_TESTIMONIALS = [
  { id: '1', name: 'Rajesh Sharma', role: 'Patient', rating: 5, comment: 'Dr. Mahesh is extremely gentle and professional. I was terrified of root canal treatments, but she completed it with absolutely zero pain. The live availability feature is a lifesaver!', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: '2', name: 'Priya Patel', role: 'Mother of 6-year-old', rating: 5, comment: 'Finding a dentist who can handle children is tough. Dr. Mahesh made my son so comfortable, he actually looks forward to his dental checkups now. Outstanding clinic!', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: '3', name: 'Vikram Mehta', role: 'Business Owner', rating: 5, comment: 'I love that I can check online if the doctor is currently in the clinic. No more calling or driving down in traffic only to find the doctor is at lunch or in surgery. Excellent execution.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' }
];

const DEFAULT_BLOGS = [
  { id: 'brushing-tips', title: 'The Correct Way to Brush: 5 Steps to Perfect Hygiene', summary: 'Most people brush daily but still get cavities. Discover the proper angle, timing, and brushing motion recommended by Dr. Mahesh.', content: 'Keeping your teeth clean isn\'t just about brushing twice a day. It\'s about HOW you brush. Dr. Mahesh recommends holding your toothbrush at a 45-degree angle to your gums. Use gentle circular motions instead of sawing back and forth. Make sure you brush for a full 2 minutes, covering all chewing surfaces, inner tooth walls, and your tongue. Finish with flossing to clean the tight gaps that brushes can\'t reach!', category: 'Brushing Tips', author: 'Dr. Mahesh', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600', createdAt: new Date() },
  { id: 'oral-health-diet', title: '5 Superfoods for Stronger Teeth and Healthy Gums', summary: 'Your diet plays an enormous role in dental health. Learn which foods naturally clean teeth and fight harmful oral bacteria.', content: 'What you eat directly affects the plaque layer on your teeth. Calcium-rich foods like cheese and yogurt help rebuild enamel. Crunchy vegetables like celery and carrots act as natural toothbrushes, stimulating saliva production and sweeping away food particles. Green tea contains antioxidants that prevent bacterial growth, and vitamin C from strawberries protects your gums against bleeding and infection.', category: 'Oral Hygiene', author: 'Dr. Mahesh', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600', createdAt: new Date() }
];

const DEFAULT_GALLERY = [
  { id: 'g1', title: 'Our Premium Reception Lounge', category: 'clinic', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600' },
  { id: 'g2', title: 'State-of-the-Art Dental Suite', category: 'clinic', image: 'https://images.unsplash.com/photo-1513412583491-0d13dd97bd01?auto=format&fit=crop&q=80&w=600' },
  { id: 'g3', title: 'Advanced Dental Laser Equipment', category: 'equipment', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600' },
  { id: 'g4', title: 'Comfortable Pediatric Treatment Room', category: 'clinic', image: 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600' }
];

export const seedDatabase = async () => {
  try {
    const servicesRef = collection(db, 'services');
    const servicesSnap = await getDocs(servicesRef);

    if (servicesSnap.empty) {
      console.log('Seeding initial data into Firestore...');

      // 1. Seed Doctor Availability document (The centerpiece status)
      await setDoc(doc(db, 'doctorAvailability', 'current'), {
        status: 'available',
        statusText: 'Dr. Mahesh is currently at the clinic and treating patients.',
        updatedAt: new Date(),
        nextAvailableTime: '3:30 PM Today',
        estimatedWaitTimeMinutes: 15,
        queueCount: 2
      });

      // 2. Seed Services
      for (const service of DEFAULT_SERVICES) {
        await setDoc(doc(db, 'services', service.id), service);
      }

      // 3. Seed Timings
      for (const timing of DEFAULT_TIMINGS) {
        await setDoc(doc(db, 'clinicTimings', timing.day), timing);
      }

      // 4. Seed FAQs
      for (const faq of DEFAULT_FAQS) {
        await setDoc(doc(db, 'FAQs', faq.id), faq);
      }

      // 5. Seed Testimonials
      for (const t of DEFAULT_TESTIMONIALS) {
        await setDoc(doc(db, 'testimonials', t.id), t);
      }

      // 6. Seed Blogs
      for (const blog of DEFAULT_BLOGS) {
        await setDoc(doc(db, 'blogs', blog.id), blog);
      }

      // 7. Seed Gallery Items
      for (const item of DEFAULT_GALLERY) {
        await setDoc(doc(db, 'gallery', item.id), item);
      }

      // 8. Seed Clinic Settings
      await setDoc(doc(db, 'settings', 'clinic_config'), {
        clinicName: 'Mahesh Dental Clinic',
        phone: '+91 98765 43210',
        email: 'contact@maheshdental.com',
        whatsapp: '+91 98765 43210',
        emergencyPhone: '+91 98765 99999',
        address: '102, Premium Plaza, Near Central Park, Sector 5, City Center',
        googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.0583707255153!2d88.4286161759495!3d22.576912832810815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275adebdf753b%3A0xe6bf44b61dbd043d!2sSector%20V!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
      });

      // 9. Seed Announcements
      await setDoc(doc(db, 'announcements', 'banner'), {
        content: '🎉 Special Monsoon Discount: 20% off on all Laser Teeth Whitening procedures this month!',
        active: true,
        createdAt: new Date()
      });

      console.log('Seeding completed successfully!');
    } else {
      console.log('Database already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
