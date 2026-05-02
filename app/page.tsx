import ChatWidget from '@/components/ChatWidget';
import { Sparkles, Calendar, Heart, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-white to-pink-50 opacity-70"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-bounce">
            <Sparkles size={16} />
            <span>Khai trương chi nhánh mới - Ưu đãi 50%</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tight">
            Glow <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Beauty</span> Spa
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Đánh thức vẻ đẹp tiềm ẩn của bạn với liệu trình chăm sóc da chuyên sâu 
            và không gian thư giãn đẳng cấp chuẩn 5 sao.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-rose-500/25 transition-all active:scale-95">
              Đặt lịch ngay
            </button>
            <a 
              href="/admin" 
              className="bg-white border-2 border-gray-100 hover:border-rose-200 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center"
            >
              Quản lý Lead (Admin)
            </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-1 h-12 rounded-full bg-rose-500"></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Calendar className="text-rose-500" />, title: 'Đặt lịch 24/7', desc: 'Dễ dàng đặt lịch hẹn bất cứ khi nào bạn muốn thông qua trợ lý AI.' },
              { icon: <Heart className="text-pink-500" />, title: 'Chăm sóc tận tâm', desc: 'Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng lắng nghe bạn.' },
              { icon: <ShieldCheck className="text-rose-500" />, title: 'An toàn tuyệt đối', desc: 'Sử dụng các sản phẩm cao cấp, có nguồn gốc rõ ràng và an toàn cho da.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                <div className="mb-6 p-4 bg-rose-50 w-fit rounded-2xl">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <ChatWidget />
      
      {/* Simple Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2024 Glow Beauty Spa. All rights reserved.</p>
      </footer>
    </main>
  );
}
