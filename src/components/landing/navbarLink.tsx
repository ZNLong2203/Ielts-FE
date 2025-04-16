import Link from "next/link";

const NavbarLink = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link
      href={href}
      className="group/parent1 font-svn-poppins flex items-center justify-between gap-x-2 rounded-2xl px-5 py-3 text-xs tracking-[0.06px] text-white text-opacity-60 transition-all hover:bg-[rgba(0,0,0,0.24)] hover:font-semibold hover:text-opacity-100 2xl:text-sm 2xl:tracking-[0.07px]"
    >
      {text}
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="arrow-right"
        className="svg-inline--fa fa-arrow-right fa-sm invisible size-5 min-w-5 group-hover/parent1:visible"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
      >
        <path
          fill="currentColor"
          d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
        ></path>
      </svg>
    </Link>
  );
};

export default NavbarLink;
