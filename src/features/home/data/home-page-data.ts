import {
  Award,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Gift,
  MenuSquare,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { HeaderLink } from '../types';

export interface FeatureCardItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface GarageService {
  title: string;
  image: string;
  description: string;
}

export interface GarageStat {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface PricingPlan {
  name: string;
  price: string;
  featured?: boolean;
  features: string[];
}

export interface MechanicProfile {
  name: string;
  role: string;
  image: string;
}

export interface BookingStep {
  title: string;
  icon: LucideIcon;
}

export interface GalleryItem {
  image: string;
  label: string;
}

export interface CustomerTestimonial {
  quote: string;
  author: string;
  image: string;
}

export const headerLinks: HeaderLink[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dịch vụ', href: '#services' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'Đội ngũ', href: '#mechanics' },
  { label: 'Thư viện', href: '#gallery' },
  { label: 'Liên hệ', href: '#booking' },
];

export const featureCards: FeatureCardItem[] = [
  {
    title: 'Đặt lịch rửa xe nhanh',
    description:
      'Chọn dịch vụ rửa xe, thời gian và gửi lịch hẹn chỉ trong vài bước. Ưu tiên xếp hàng theo hạng thành viên.',
    icon: CalendarCheck,
  },
  {
    title: 'Theo dõi lịch sử rửa xe',
    description: 'Lưu lại toàn bộ lịch sử rửa xe và chăm sóc ngoại thất của xe.',
    icon: ClipboardCheck,
  },
  {
    title: 'Tích điểm & Đổi thưởng',
    description:
      'Tự động tích điểm sau mỗi lần rửa xe. Đổi điểm lấy dịch vụ detailing, phủ ceramic và ưu đãi độc quyền.',
    icon: Gift,
  },
];

export const services: GarageService[] = [
  {
    title: 'Rửa xe toàn diện',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=500&fit=crop',
    description:
      'Vệ sinh ngoại thất, lau khô, làm sạch kính và lốp xe với quy trình chuyên nghiệp.',
  },
  {
    title: 'Vệ sinh nội thất',
    image: 'https://images.unsplash.com/photo-1732357624591-f2137085659b?w=800&h=500&fit=crop',
    description: 'Hút bụi, lau sạch khoang lái, vệ sinh ghế da và các chi tiết nội thất.',
  },
  {
    title: 'Rửa gầm xe',
    image: 'https://images.unsplash.com/photo-1565689876697-e467b6c54da2?w=800&h=500&fit=crop',
    description: 'Vệ sinh gầm xe, loại bỏ bùn đất và các chất bẩn bám dưới gầm.',
  },
  {
    title: 'Khử mùi & Diệt khuẩn',
    image: 'https://images.unsplash.com/photo-1632823469901-5d2cfff5ba50?w=800&h=500&fit=crop',
    description:
      'Khử mùi nội thất, diệt khuẩn khoang lái và hệ thống điều hòa bằng công nghệ ozone.',
  },
  {
    title: 'Phủ ceramic',
    image: 'https://images.unsplash.com/photo-1611239179213-d972da54091a?w=800&h=500&fit=crop',
    description:
      'Phủ bảo vệ sơn ceramic giúp xe bóng đẹp, chống bám bẩn và bảo vệ khỏi tác động môi trường.',
  },
  {
    title: 'Vệ sinh khoang máy',
    image: 'https://images.unsplash.com/photo-1620584898989-d39f7f9ed1b7?w=800&h=500&fit=crop',
    description:
      'Làm sạch khoang máy, loại bỏ dầu mỡ và bụi bẩn, giúp khoang máy luôn sạch sẽ và bền bỉ.',
  },
  {
    title: 'Chăm sóc đèn & Kính',
    image: 'https://images.unsplash.com/photo-1527581849771-416a9d62308e?w=800&h=500&fit=crop',
    description: 'Phục hồi và đánh bóng đèn pha, xử lý kính chắn gió bị ố vàng và trầy xước.',
  },
  {
    title: 'Detailing & Đánh bóng',
    image: 'https://images.unsplash.com/photo-1689182358896-2514cd65dfff?w=800&h=500&fit=crop',
    description:
      'Dịch vụ thưởng dành cho thành viên tích điểm. Phục hồi sơn, đánh bóng và bảo vệ xe toàn diện.',
  },
];

export const stats: GarageStat[] = [
  { value: '5,000+', label: 'lượt rửa xe', icon: Sparkles },
  { value: '8+', label: 'dịch vụ', icon: Award },
  { value: '15+', label: 'chuyên viên', icon: Users },
  { value: '99%', label: 'hài lòng', icon: Trophy },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Rửa Cơ Bản',
    price: '150K',
    features: ['Rửa ngoại thất', 'Lau khô & làm sạch kính', 'Vệ sinh lốp & mâm xe'],
  },
  {
    name: 'Rửa Cao Cấp',
    price: '350K',
    features: [
      'Rửa ngoại thất toàn diện',
      'Vệ sinh nội thất',
      'Hút bụi khoang lái',
      'Khử mùi cơ bản',
    ],
  },
  {
    name: 'Chăm Sóc Toàn Diện',
    price: '850K',
    featured: true,
    features: [
      'Toàn bộ hạng mục gói Rửa Cao Cấp',
      'Tẩy ố kính & tẩy mạt sắt, nhựa đường',
      'Phủ Quick Ceramic Wax toàn xe',
      'Vệ sinh cửa gió & xông tinh dầu',
      'Dưỡng ghế da & phục hồi nhựa taplo',
      'Ưu tiên hàng đợi & nhân 3 điểm thưởng',
      'Phòng chờ VIP & đồ uống miễn phí',
    ],
  },
];

export const mechanics: MechanicProfile[] = [
  {
    name: 'Nguyễn Minh An',
    role: 'Chuyên viên rửa xe',
    image: '/images/team/1.jpg',
  },
  {
    name: 'Trần Quốc Bảo',
    role: 'Chuyên viên detailing',
    image: '/images/team/2.jpg',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Chuyên viên chăm sóc nội thất',
    image: '/images/team/3.jpg',
  },
  {
    name: 'Phạm Tuấn Kiệt',
    role: 'Cố vấn dịch vụ',
    image: '/images/team/4.jpg',
  },
];

export const bookingSteps: BookingStep[] = [
  { title: 'Chọn dịch vụ rửa xe', icon: MenuSquare },
  { title: 'Chọn thời gian phù hợp', icon: Clock3 },
  { title: 'Xác nhận thông tin xe', icon: ShieldCheck },
  { title: 'Đến AutoWash sử dụng dịch vụ', icon: CheckCircle2 },
];

export const gallery: GalleryItem[] = [
  { image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop', label: 'Rửa xe chuyên nghiệp' },
  { image: 'https://images.unsplash.com/photo-1694678505383-676d78ea3b96?w=600&h=400&fit=crop', label: 'Detailing — Ưu đãi thành viên' },
  { image: 'https://images.unsplash.com/photo-1732357624591-f2137085659b?w=600&h=400&fit=crop', label: 'Vệ sinh nội thất' },
  { image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop', label: 'Không gian AutoWash' },
  { image: 'https://images.unsplash.com/photo-1704796141009-5ed5cc8ca5f3?w=600&h=400&fit=crop', label: 'Đổi điểm lấy detailing' },
  { image: 'https://images.unsplash.com/photo-1605164599901-f8a1464a2c87?w=600&h=400&fit=crop', label: 'Tư vấn dịch vụ' },
  { image: 'https://images.unsplash.com/photo-1611239179213-d972da54091a?w=600&h=400&fit=crop', label: 'Phủ ceramic' },
  { image: 'https://images.unsplash.com/photo-1565689876697-e467b6c54da2?w=600&h=400&fit=crop', label: 'Rửa gầm xe' },
  { image: 'https://images.unsplash.com/photo-1605164598708-25701594473e?w=600&h=400&fit=crop', label: 'Rửa xe định kỳ' },
  { image: 'https://images.unsplash.com/photo-1608506375591-b90e1f955e4b?w=600&h=400&fit=crop', label: 'Khu vực tiếp nhận' },
  { image: 'https://images.unsplash.com/photo-1518306727298-4c17e1bf6942?w=600&h=400&fit=crop', label: 'Vệ sinh khoang máy' },
  { image: 'https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=600&h=400&fit=crop', label: 'Giao xe hoàn tất' },
];

export const testimonials: CustomerTestimonial[] = [
  {
    quote:
      'Đặt lịch rửa xe rất nhanh, AutoWash xác nhận rõ ràng và nhắc lịch trước khi đến. Tôi có thể xem lại toàn bộ lịch sử chăm sóc xe và tích điểm đổi ưu đãi.',
    author: 'Nguyễn Minh Anh',
    image: '/images/testimonials/1.jpg',
  },
  {
    quote:
      'AutoWash Pro giúp tôi tiết kiệm thời gian, biết trước chi phí và nhận ưu đãi thành viên sau mỗi lần rửa xe. Tích điểm đủ tôi còn được đổi detailing miễn phí, quá tuyệt vời.',
    author: 'Trần Hải Dương',
    image: '/images/testimonials/2.jpg',
  },
];
