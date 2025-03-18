import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="relative mr-2 w-10 h-10 bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 rounded-lg shadow-lg flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 rounded-lg blur-sm opacity-70"></div>
                <span className="relative z-10 text-white font-bold text-xl">A</span>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 select-none">
                AuraClear
              </h3>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
            ผลิตภัณฑ์เสริมความงามระดับพรีเมียมสำหรับกิจวัตรประจำวันของคุณ ค้นพบสิ่งที่ดีที่สุดในด้านการดูแลผิว การแต่งหน้า และน้ำหอม
            </p>
            <div className="flex space-x-4">
              {/* Facebook */}
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </Link>
              {/* TikTok */}
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/>
                </svg>
              </Link>
              {/* LINE */}
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.433-.555 2.723-1.715 3.994-1.678 1.932-5.431 4.285-6.285 4.645-.83.35-.734-.197-.696-.413l.003-.018.114-.685c.027-.204.055-.521-.026-.723-.09-.223-.444-.339-.704-.395C2.846 12.39 0 9.701 0 6.492 0 2.912 3.59 0 8 0ZM5.022 7.686H3.497V4.918a.156.156 0 0 0-.155-.156H2.78a.156.156 0 0 0-.156.156v3.486c0 .041.017.08.044.107v.001l.002.002.002.002a.154.154 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.155Zm.791-2.924a.156.156 0 0 0-.156.156v3.486c0 .086.07.155.156.155h.562c.086 0 .155-.07.155-.155V4.918a.156.156 0 0 0-.155-.156h-.562Zm3.863 0a.156.156 0 0 0-.156.156v2.07L7.923 4.832a.17.17 0 0 0-.013-.015v-.001a.139.139 0 0 0-.01-.01l-.003-.003a.092.092 0 0 0-.011-.009h-.001L7.88 4.79l-.003-.002a.029.029 0 0 0-.005-.003l-.008-.005h-.002l-.003-.002-.01-.004-.004-.002a.093.093 0 0 0-.01-.003h-.002l-.003-.001-.009-.002h-.006l-.003-.001h-.004l-.002-.001h-.574a.156.156 0 0 0-.156.155v3.486c0 .086.07.155.156.155h.56c.087 0 .157-.07.157-.155v-2.07l1.6 2.16a.154.154 0 0 0 .039.038l.001.001.01.006.003.002.01.004.002.001.01.003h.003a.158.158 0 0 0 .082.022h.561c.086 0 .155-.07.155-.155V4.918a.156.156 0 0 0-.155-.156h-.561Zm3.815.717v-.56a.156.156 0 0 0-.155-.157h-2.242a.155.155 0 0 0-.108.044h-.001l-.001.002-.002.003a.156.156 0 0 0-.044.107v3.486c0 .041.017.08.044.107l.002.003.002.002a.156.156 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.156h-1.526V7.05h1.526c.086 0 .155-.07.155-.155v-.56a.156.156 0 0 0-.155-.157h-1.526V5.48h1.526c.086 0 .155-.07.155-.156Z"/>
                </svg>
              </Link>
              {/* WeChat */}
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.176 14.429c-2.665 0-4.826-1.8-4.826-4.018 0-2.22 2.159-4.02 4.824-4.02S16 8.191 16 10.411c0 1.21-.65 2.301-1.666 3.036a.324.324 0 0 0-.12.366l.218.81a.616.616 0 0 1 .029.117.166.166 0 0 1-.162.162.177.177 0 0 1-.092-.03l-1.057-.61a.519.519 0 0 0-.256-.074.509.509 0 0 0-.142.021 5.668 5.668 0 0 1-1.576.22ZM9.064 9.542a.647.647 0 1 0 .557-1 .645.645 0 0 0-.646.647.615.615 0 0 0 .09.353Zm3.232.001a.646.646 0 1 0 .546-1 .645.645 0 0 0-.644.644.627.627 0 0 0 .098.356Z"/>
                  <path d="M0 6.826c0 1.455.781 2.765 2.001 3.656a.385.385 0 0 1 .143.439l-.161.6-.1.373a.499.499 0 0 0-.032.14.192.192 0 0 0 .193.193c.039 0 .077-.01.111-.029l1.268-.733a.622.622 0 0 1 .308-.088c.058 0 .116.009.171.025a6.83 6.83 0 0 0 1.625.26 4.45 4.45 0 0 1-.177-1.251c0-2.936 2.785-5.02 5.824-5.02.05 0 .1 0 .15.002C10.587 3.429 8.392 2 5.796 2 2.596 2 0 4.16 0 6.826Zm4.632-1.555a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0Zm3.875 0a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0Z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><Link href="/" className="text-gray-400 hover:text-white">หน้าหลัก</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">ร้านค้า</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">เกี่ยวกับเรา</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">ติดต่อเรา</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">บล็อก</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Categories</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li><Link href="/products/skincare" className="text-gray-400 hover:text-white">การดูแลผิว</Link></li>
              <li><Link href="/products/makeup" className="text-gray-400 hover:text-white">การแต่งหน้า</Link></li>
              <li><Link href="/products/fragrances" className="text-gray-400 hover:text-white">น้ำหอม</Link></li>
              <li><Link href="/products/hair" className="text-gray-400 hover:text-white">การดูแลเส้นผม</Link></li>
              <li><Link href="/products/body" className="text-gray-400 hover:text-white">การดูแลผิวกาย</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">สมัครรับข่าวสาร</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">รับข่าวสารล่าสุดจากเรา</p>
            <div className="flex flex-col space-y-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-800 border-gray-700 text-white text-sm sm:text-base"
              />
              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">สมัครรับข่าวสาร</Button>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} AuraClear. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-xs sm:text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-xs sm:text-sm">
              Terms of Service
            </Link>
            <Link href="/shipping" className="text-gray-400 hover:text-white text-xs sm:text-sm">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 