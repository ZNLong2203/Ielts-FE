const NavbarTitle = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <div className="group/parent relative flex cursor-pointer items-center gap-x-2.5 rounded-[32px] px-5 py-3 text-xs tracking-[0.06px] hover:text-white data-[state=open]:text-white lg:max-2xl:px-3 2xl:text-sm 2xl:tracking-[0.07px]">
        {text}
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="sort-down"
        className="svg-inline--fa fa-sort-down -mt-1.5 w-2.5 transition-all group-hover/parent:mt-1 group-hover/parent:-rotate-180"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
      >
        <path
          fill="currentColor"
          d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8l256 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"
        ></path>
      </svg>
      {children}
    </div>
  );
};

export default NavbarTitle
