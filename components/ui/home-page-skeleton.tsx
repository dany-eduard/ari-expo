import { View } from "react-native";
import { Skeleton, SkeletonCircle } from "./skeleton";

export function HomePageSkeleton() {
  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border-input-light dark:border-border-input-dark bg-background-light dark:bg-background-dark">
        <Skeleton width={60} height={24} borderRadius={4} />
        <SkeletonCircle size={40} />
      </View>

      <View className="flex-1 p-4">
        {/* Profile Section */}
        <View className="flex-row items-center gap-4 pb-6">
          <SkeletonCircle size={64} />
          <View className="flex-1 gap-2">
            <Skeleton width="50%" height={28} borderRadius={4} />
            <Skeleton width="80%" height={16} borderRadius={4} />
          </View>
        </View>

        {/* Monthly Summary Card */}
        <View className="pb-6">
          <View className="overflow-hidden rounded-xl bg-sky-500 p-6 shadow-xl relative border border-sky-400/20">
            {/* Background decorative circles */}
            <View
              className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full"
              style={{ transform: [{ scale: 1.5 }] }}
            />
            <View
              className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-sky-300/20 rounded-full"
              style={{ transform: [{ scale: 1.2 }] }}
            />

            <View className="z-10">
              <Skeleton width="90%" height={10} borderRadius={4} />
              <View className="flex-row items-baseline mt-3 gap-2">
                <Skeleton width="40%" height={36} borderRadius={4} />
                <Skeleton width="20%" height={20} borderRadius={4} />
              </View>
              <View className="flex-row justify-between mt-4">
                <Skeleton width={60} height={20} borderRadius={12} />
              </View>
              <View className="mt-4">
                <View className="flex-row justify-between mb-2">
                  <Skeleton width={50} height={10} borderRadius={4} />
                  <Skeleton width={30} height={10} borderRadius={4} />
                </View>
                <Skeleton width="100%" height={10} borderRadius={5} />
              </View>
              <Skeleton width="100%" height={48} borderRadius={12} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="pb-2">
          <Skeleton width={140} height={24} borderRadius={4} />
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1 rounded-xl p-4 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark items-center gap-3">
              <SkeletonCircle size={48} />
              <Skeleton width="80%" height={16} borderRadius={4} />
            </View>
            <View className="flex-1 rounded-xl p-4 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark items-center gap-3">
              <SkeletonCircle size={48} />
              <Skeleton width="80%" height={16} borderRadius={4} />
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row gap-2 py-3">
          <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
            <View className="flex-row items-center justify-between">
              <SkeletonCircle size={36} />
              <View className="items-end gap-1">
                <Skeleton width={30} height={20} borderRadius={4} />
                <Skeleton width={40} height={10} borderRadius={4} />
              </View>
            </View>
          </View>
          <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
            <View className="flex-row items-center justify-between">
              <SkeletonCircle size={36} />
              <View className="items-end gap-1">
                <Skeleton width={30} height={20} borderRadius={4} />
                <Skeleton width={40} height={10} borderRadius={4} />
              </View>
            </View>
          </View>
          <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
            <View className="flex-row items-center justify-between">
              <SkeletonCircle size={36} />
              <View className="items-end gap-1">
                <Skeleton width={30} height={20} borderRadius={4} />
                <Skeleton width={40} height={10} borderRadius={4} />
              </View>
            </View>
          </View>
        </View>

        {/* Predication Summary Section */}
        <View className="pt-2">
          <Skeleton width={160} height={24} borderRadius={4} />
          <View className="flex-row gap-2 pt-3">
            {/* Publicadores */}
            <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
              <View className="flex-row items-center gap-1.5 mb-2">
                <SkeletonCircle size={16} />
                <Skeleton width={70} height={12} borderRadius={4} />
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Skeleton width={40} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={50} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
              </View>
            </View>

            {/* Auxiliares */}
            <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
              <View className="flex-row items-center gap-1.5 mb-2">
                <SkeletonCircle size={16} />
                <Skeleton width={60} height={12} borderRadius={4} />
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Skeleton width={40} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={30} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={50} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
              </View>
            </View>

            {/* Regulares */}
            <View className="flex-1 rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark">
              <View className="flex-row items-center gap-1.5 mb-2">
                <SkeletonCircle size={16} />
                <Skeleton width={50} height={12} borderRadius={4} />
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Skeleton width={40} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={30} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
                <View className="flex-row justify-between">
                  <Skeleton width={50} height={10} borderRadius={4} />
                  <Skeleton width={20} height={10} borderRadius={4} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View className="pt-6 pb-6">
          <View className="flex-row items-center justify-between pb-4">
            <Skeleton width={140} height={24} borderRadius={4} />
            <Skeleton width={50} height={16} borderRadius={4} />
          </View>
          <View className="gap-3">
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="flex-row items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-input-light dark:border-border-input-dark"
              >
                <SkeletonCircle size={40} />
                <View className="flex-1 gap-1">
                  <Skeleton width="60%" height={14} borderRadius={4} />
                  <Skeleton width="90%" height={12} borderRadius={4} />
                </View>
                <Skeleton width={40} height={10} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
