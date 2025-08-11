import { FiMail, FiPhone, FiHeart } from "react-icons/fi";

export default function Footer() {
  return (
    <footer
      className="bg-gradient-to-r from-black via-gray-900 to-black 
                     border-t border-white/10 text-white py-8 mt-auto
                     backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-4 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl 
                      animate-pulse"
        ></div>
        <div
          className="absolute bottom-4 right-1/3 w-16 h-16 bg-white/5 rounded-full blur-lg 
                      animate-pulse delay-300"
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="text-center space-y-6 animate-fade-in">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3 group">
              <div
                className="w-8 h-8 bg-gradient-to-br from-white/20 to-gray-300/20 
                            rounded-lg flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300"
              >
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <h3
                className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 
                           bg-clip-text text-transparent
                           group-hover:from-gray-200 group-hover:to-white transition-all duration-300"
              >
                Sakarya Teknokent
              </h3>
            </div>

            <p
              className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed
                        hover:text-white/80 transition-colors duration-300"
            >
              Teknoloji ve inovasyonda öncü, geleceği şekillendiren projelerle
              büyüyen bir ekosistem.
            </p>
          </div>

          {/* Contact info */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center 
                        gap-6 sm:gap-8 text-sm"
          >
            <div className="flex items-center space-x-2 group">
              <FiMail
                className="w-4 h-4 text-white/60 group-hover:text-white/80 
                               transition-colors duration-300"
              />
              <a
                href="mailto:info@teknokent.com"
                className="text-white/70 hover:text-white transition-colors duration-300
                         hover:underline underline-offset-2"
              >
                info@teknokent.com
              </a>
            </div>

            <div className="hidden sm:block w-px h-4 bg-white/20"></div>

            <div className="flex items-center space-x-2 group">
              <FiPhone
                className="w-4 h-4 text-white/60 group-hover:text-white/80 
                                transition-colors duration-300"
              />
              <span
                className="text-white/70 group-hover:text-white/80 
                             transition-colors duration-300"
              >
                +90 264 123 4567
              </span>
            </div>
          </div>

          {/* Separator */}
          <div
            className="w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent 
                        mx-auto"
          ></div>

          {/* Copyright */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center 
                        gap-2 text-xs text-white/50"
          >
            <div className="flex items-center space-x-1">
              <span>&copy; {new Date().getFullYear()}</span>
              <span>Sakarya Teknokent.</span>
              <span>Tüm hakları saklıdır.</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1">
              <span>•</span>
              <span>Made with</span>
              <FiHeart className="w-3 h-3 text-red-400 animate-pulse" />
              <span>in Turkey</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px 
                    bg-gradient-to-r from-transparent via-white/20 to-transparent"
      ></div>
    </footer>
  );
}
