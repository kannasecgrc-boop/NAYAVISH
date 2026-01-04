
import React from 'react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-6">{settings.storeName}</h3>
            <p className="text-gray-500 font-medium max-w-md leading-relaxed mb-8">{settings.heroSubtitle}</p>
            <div className="flex gap-4">
               <div className="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Order</p>
                  <p className="font-black text-gray-900">+91 {settings.whatsappNumber}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
                  <p className="font-black text-gray-900 truncate">{settings.supportEmail}</p>
               </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Our Location</h4>
            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
               <p className="font-bold text-gray-900 text-sm leading-relaxed">{settings.officeAddress}</p>
               <a 
                 href={`https://www.google.com/maps/search/${encodeURIComponent(settings.officeAddress)}`}
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-block mt-4 text-[10px] font-black text-brand uppercase underline"
               >
                 Get Directions
               </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Operating Hours</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                 <span className="text-gray-400">Lunch</span>
                 <span className="text-gray-900">{settings.operatingHoursLunch}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                 <span className="text-gray-400">Dinner</span>
                 <span className="text-gray-900">{settings.operatingHoursDinner}</span>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-xl text-center">
                 <p className="text-[9px] font-black text-green-600 uppercase">{settings.operatingDays}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-50 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            © {new Date().getFullYear()} {settings.storeName} • Authentic Taste of Madhira
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
