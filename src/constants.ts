import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import IconTodo from "@/assets/icons/IconTodo.svg";
import IconCalendar from "@/assets/icons/IconCalendar.svg";
import IconImgbed from "@/assets/icons/IconImgbed.svg"
import IconTomato from "@/assets/icons/IconTomato.svg"
import IconPaste from "@/assets/icons/IconPaste.svg"
import IconMemo from "@/assets/icons/IconMemo.svg"
import IconRename from "@/assets/icons/IconRename.svg"
import IconCompressImg from "@/assets/icons/IconCompressImg.svg"
import IconBluesky from "@/assets/icons/IconBluesky.svg"
import IconReddit from "@/assets/icons/IconReddit.svg"
import IconTwitter from "@/assets/icons/IconTwitter.svg"
import IconDoc from "@/assets/icons/IconDoc.svg"
import IconTools from "@/assets/icons/IconTools.svg"
import IconChat from "@/assets/icons/IconChat.svg"
import IconSpotify from "@/assets/icons/IconSpotify.svg"
import { SITE } from "@/config";
import type { GiscusProps } from "@giscus/react";


export const GISCUS: GiscusProps = {
  repo: "Excalibra/excalibra.github.io",
  repoId: "R_kgDONa7BCg",
  category: "Announcements",
  categoryId: "DIC_kwDONa7BCs4C6SPV",
  mapping: "title",           
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "top",      
  lang: "en",       
  loading: "lazy"
};

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

interface DEPLOY {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "Mail",
    href: "mailto:excalibra@proton.me",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
  {
    name: "Spotify",
    href: "#",
    linkTitle: `${SITE.title} on Spotify`,
    icon: IconSpotify,
  },
  {
    name: "Reddit",
    href: "#",
    linkTitle: `${SITE.title} on Reddit`,
    icon: IconReddit,
  },
  {
    name: "Twitter",
    href: "#",
    linkTitle: `${SITE.title} on Twitter`,
    icon: IconTwitter,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;

export const DEPLOY_LINKS: DEPLOY[] = [
  {
    name: "Todo",
    href: "#",
    linkTitle: `${SITE.title} on Todo`,
    icon: IconTodo,
  },
  {
    name: "Tomato",
    href: "#",
    linkTitle: `${SITE.title} on Tomato`,
    icon: IconTomato,
  },
  {
    name: "Calendar",
    href: "#",
    linkTitle: `${SITE.title} on Calendar`,
    icon: IconCalendar,
  },
  {
    name: "Rename",
    href: "#",
    linkTitle: `${SITE.title} on Rename`,
    icon: IconRename,
  },
  {
    name: "Pic-smaller",
    href: "#",
    linkTitle: `${SITE.title} on Pic-smaller`,
    icon: IconCompressImg,
  },
  {
    name: "IT-tools",
    href: "#",
    linkTitle: `${SITE.title} on IT-tools`,
    icon: IconTools,
  },
  {
    name: "Imgbed",
    href: "#",
    linkTitle: `${SITE.title} on Imgbed`,
    icon: IconImgbed,
  },
  {
    name: "CloudPaste",
    href: "#",
    linkTitle: `${SITE.title} onCloudPaste`,
    icon: IconPaste,
  },
  {
    name: "Starlight-Notes",
    href: "#",
    linkTitle: `${SITE.title} on Docs`,
    icon: IconDoc,
  },
  {
    name: "Memos-Worker",
    href: "#",
    linkTitle: `${SITE.title} on memos-worker`,
    icon: IconMemo,
  },
  ] as const;
