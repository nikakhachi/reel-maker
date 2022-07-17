import { createContext, useState, ReactNode } from "react";
import { ProcessedVideoType } from "../hooks/useProcessedVideosProvider";
import { YoutubeVideoType } from "../hooks/useYoutubeVideosProvider";

export type SubscriptionType = {
  id: number;
  title: string;
  durationInDays: number;
  priceInDollars: number;
  isActive: boolean;
  transcriptionSeconds: number;
};

export type UserType = {
  username: string;
  email: string;
  subscriptionActivationDate: Date;
  subscription: SubscriptionType;
  secondsTranscripted: number;
};

type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  youtubeVideos: YoutubeVideoType[];
  setYoutubeVideos: React.Dispatch<React.SetStateAction<YoutubeVideoType[]>>;
  youtubeVideosFullData: ({
    videoId: string;
  } & ProcessedVideoType)[];
  setYoutubeVideosFullData: React.Dispatch<
    React.SetStateAction<
      ({
        videoId: string;
      } & ProcessedVideoType)[]
    >
  >;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideoType[]>([]);
  const [youtubeVideosFullData, setYoutubeVideosFullData] = useState<({ videoId: string } & ProcessedVideoType)[]>([]);

  const value = {
    user,
    setUser,
    youtubeVideos,
    setYoutubeVideos,
    youtubeVideosFullData,
    setYoutubeVideosFullData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
