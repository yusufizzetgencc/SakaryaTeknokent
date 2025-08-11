export default function OnayBekleniyorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md p-8 bg-white shadow-lg rounded-xl text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Hesabınız Onay Bekliyor
        </h1>
        <p className="text-gray-700">
          Giriş yapmış olmanıza rağmen henüz yönetici tarafından onaylanmadınız.
          Lütfen onay süreciniz tamamlanana kadar bekleyin.
        </p>
      </div>
    </div>
  );
}
