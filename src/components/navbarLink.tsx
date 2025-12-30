import Link from "next/link";

const NavbarLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link
      href={href}
      className="font-svn-poppins flex items-center justify-center rounded-2xl px-7 py-3 text-xs tracking-[0.06px] text-white text-opacity-60 transition-all hover:bg-[rgba(0,0,0,0.24)] hover:font-semibold hover:text-opacity-100 2xl:text-sm 2xl:tracking-[0.07px] w-[100px] lg:max-2xl:px-6 lg:max-2xl:w-[95px]"
    >
      {text}
    </Link>
  );
};

export default NavbarLink;
