import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout = ({ children, hideFooter }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
};

export default Layout;
