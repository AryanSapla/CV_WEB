const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

export function IconBriefcase() {
  return (
    <svg {...iconProps}>
      <path d="M10 2h4a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm4 3V4h-4v1h4zm-8 4v2h16V9H6zm0 4v5h12v-5H6z" />
    </svg>
  );
}

export function IconHome() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l9 8h-3v9H6v-9H3l9-8zm0 2.8L7 11h2v7h6v-7h2l-5-5.2z" />
    </svg>
  );
}

export function IconMail() {
  return (
    <svg {...iconProps}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.3l8 5.6 8-5.6V6H4zm16 2.4l-8 5.6-8-5.6V18h16V10.4z" />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg {...iconProps}>
      <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.3 22 2 13.7 2 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.3 1L6.6 10.8z" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg {...iconProps}>
      <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2zm13 8H4v10h16V10zm0-4H4v2h16V6z" />
    </svg>
  );
}

export function IconSpark() {
  return (
    <svg {...iconProps}>
      <path d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5L12 2zm-7 9l1.2 3.5L9.5 15l-3.3 1 1-3.3L6 9.5 9.5 8 5 11zm14 0l-1.2 3.5L14.5 15l3.3 1-1-3.3L18 9.5 14.5 8 19 11z" />
    </svg>
  );
}
