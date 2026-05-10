import React from "react";
import {
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUpRight as PhArrowUpRight,
  ArrowSquareOut,
  Bell as PhBell,
  Buildings,
  Clock as ClockIcon,
  CalendarDots,
  Camera as PhCamera,
  CaretDown,
  CaretRight,
  CaretUp,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  CheckSquare as PhCheckSquare,
  ChatsCircle,
  CreditCard as PhCreditCard,
  CurrencyDollar,
  DotsThree,
  DownloadSimple,
  EnvelopeSimple,
  Eye as PhEye,
  EyeSlash,
  FileText as PhFileText,
  FloppyDisk,
  FadersHorizontal,
  LinkSimple,
  List as PhList,
  LockSimple,
  MagnifyingGlass,
  MapPin as PhMapPin,
  Moon as PhMoon,
  Note,
  PaperPlaneTilt,
  Pen,
  PencilSimple,
  Plus as PhPlus,
  Question,
  SealCheck,
  Shield as PhShield,
  SignOut,
  Sparkle,
  SpinnerGap,
  Square as PhSquare,
  SquaresFour,
  SuitcaseSimple,
  Trash,
  TrendUp,
  UploadSimple,
  User as PhUser,
  UsersThree,
  WarningCircle,
  X as PhX,
  XCircle as PhXCircle,
} from "@phosphor-icons/react";

const withDefaultWeight = (Icon, defaultWeight = "regular") => {
  const WrappedIcon = ({ weight = defaultWeight, ...props }) => (
    <Icon weight={weight} {...props} />
  );
  WrappedIcon.displayName = `Wrapped${Icon.displayName || Icon.name || "Icon"}`;
  return WrappedIcon;
};

export const Mail = withDefaultWeight(EnvelopeSimple);
export const Plus = withDefaultWeight(PhPlus);
export const Send = withDefaultWeight(PaperPlaneTilt);
export const TrendingUp = withDefaultWeight(TrendUp);
export const MessageSquare = withDefaultWeight(ChatsCircle);
export const Users = withDefaultWeight(UsersThree);
export const ArrowLeft = withDefaultWeight(PhArrowLeft);
export const Loader2 = ({ className = "", ...props }) => (
  <SpinnerGap className={`animate-spin ${className}`.trim()} {...props} />
);
export const Briefcase = withDefaultWeight(SuitcaseSimple);
export const CheckCircle = withDefaultWeight(PhCheckCircle);
export const XCircle = withDefaultWeight(PhXCircle);
export const AlertCircle = withDefaultWeight(WarningCircle);
export const Calendar = withDefaultWeight(CalendarDots);
export const Building2 = withDefaultWeight(Buildings);
export const MapPin = withDefaultWeight(PhMapPin);
export const FileText = withDefaultWeight(PhFileText);
export const Download = withDefaultWeight(DownloadSimple);
export const X = withDefaultWeight(PhX);
export const ChevronDown = withDefaultWeight(CaretDown);
export const ChevronUp = withDefaultWeight(CaretUp);
export const Trash2 = withDefaultWeight(Trash);
export const ExternalLink = withDefaultWeight(ArrowSquareOut);
export const Filter = withDefaultWeight(FadersHorizontal);
export const Search = withDefaultWeight(MagnifyingGlass);
export const Pencil = withDefaultWeight(PencilSimple);
export const Sparkles = withDefaultWeight(Sparkle, "fill");
export const Save = withDefaultWeight(FloppyDisk);
export const Link2 = withDefaultWeight(LinkSimple);
export const CheckCircle2 = withDefaultWeight(SealCheck);
export const Clock = withDefaultWeight(ClockIcon);
export const DollarSign = withDefaultWeight(CurrencyDollar);
export const Check = withDefaultWeight(PhCheck);
export const Lock = withDefaultWeight(LockSimple);
export const Eye = withDefaultWeight(PhEye);
export const EyeOff = withDefaultWeight(EyeSlash);
export const ArrowRight = withDefaultWeight(PhArrowRight);
export const ArrowUpRight = withDefaultWeight(PhArrowUpRight);
export const User = withDefaultWeight(PhUser);
export const LogOut = withDefaultWeight(SignOut);
export const Bell = withDefaultWeight(PhBell);
export const Shield = withDefaultWeight(PhShield);
export const Moon = withDefaultWeight(PhMoon);
export const CreditCard = withDefaultWeight(PhCreditCard);
export const HelpCircle = withDefaultWeight(Question);
export const ChevronRight = withDefaultWeight(CaretRight);
export const Camera = withDefaultWeight(PhCamera);
export const Upload = withDefaultWeight(UploadSimple);
export const StickyNote = withDefaultWeight(Note);
export const Square = withDefaultWeight(PhSquare);
export const CheckSquare = withDefaultWeight(PhCheckSquare);

// --- Newly Added Missing Icons ---
export const Edit3 = withDefaultWeight(Pen);
export const MoreHorizontal = withDefaultWeight(DotsThree);
export const LayoutDashboard = withDefaultWeight(SquaresFour);
export const List = withDefaultWeight(PhList);