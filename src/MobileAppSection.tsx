const APP_PREVIEW = "https://cdn.hackclub.com/01a0925c-678e-72c8-89d2-a6c13b6818ac/smartphone_portrait__1_.png";

export default function MobileAppSection() {
  return (
    <section
      id="app"
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
    >
      <img
        src={APP_PREVIEW}
        alt="BitBuzz mobile app"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </section>
  );
}
