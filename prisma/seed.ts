import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Yetkiler (permissions)
  const permissionsData = [
    { key: "create_leave_request", name: "İzin Talebi Oluşturma" },
    { key: "creating_purchase_request", name: "Satın Alma Talebi Oluşturma" },
    { key: "view_users", name: "Kullanıcıları Görüntüleme" },
    { key: "viewing_pending_approval", name: "Onay Bekleyenleri Görüntüleme" },
    { key: "role_authority_editing", name: "Rol ve Yetki Düzenleme" },
    { key: "view_leave_request", name: "İzin Talebini Görüntüleme" },
    { key: "approving_leave_request", name: "İzin Talebini Onaylama" },
    { key: "adding_supplier", name: "Tedarikçi Ekleme" },
    {
      key: "view_purchase_requests",
      name: "Satın Alma Taleplerini Görüntüleme",
    },
    {
      key: "view_all_leave_requests",
      name: "Tüm İzin Taleplerini Görüntüleme",
    },
    {
      key: "updating_purchasing_categories",
      name: "Satın Alma Kategorilerini Güncelleme",
    },
    {
      key: "first_approval",
      name: "Birinci Onay",
    },
    {
      key: "second_approval",
      name: "İkinci Onay",
    },
    {
      key: "third_approval",
      name: "Üçüncü Onay",
    },
    {
      key: "invoice_upload",
      name: "Fatura Yükleme",
    },
    {
      key: "invoice_check",
      name: "Fatura Kontrolü",
    },
    {
      key: "invoice_register",
      name: "Fatura Kaydı",
    },
    {
      key: "request_phase",
      name: "Talep Aşaması",
    },
    {
      key: "maintenance_categories",
      name: "Bakım Kategorileri",
    },
    {
      key: "add_new_device",
      name: "Yeni Cihaz Ekle",
    },

    {
      key: "viewing_devices",
      name: "Cihazları Görüntüleme",
    },
    {
      key: "annual_maintenance_planning",
      name: "Yıllık Bakım Planlama",
    },
    {
      key: "periodic_control",
      name: "Periyodik Kontrol",
    },
    {
      key: "fault_management",
      name: "Arıza Yönetimi",
    },
    {
      key: "maintenance_reporting",
      name: "Bakım Raporlama",
    },
  ];

  // Yetkileri upsert et
  for (const permission of permissionsData) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name },
      create: { key: permission.key, name: permission.name },
    });
  }

  console.log("✅ Yetkiler başarıyla eklendi.");

  // Roller
  const rolesData = [
    { name: "admin", description: "Genel Müdür" },
    { name: "assistant", description: "Genel Müdür Yardımcısı" },
    { name: "secretary", description: "Özel Kalem" },
    { name: "adminTech", description: "İdari ve Teknik İşler" },
    { name: "finance", description: "Mali İşler Sorumlusu" },
    { name: "operations", description: "Operasyon Sorumlusu" },
    { name: "hr", description: "İnsan Kaynakları" },
    { name: "coordinator", description: "Koordinatör" },
    { name: "specialist", description: "Uzman" },
    { name: "assistantSpecialist", description: "Uzman Yardımcısı" },
    { name: "intern", description: "Stajyer" },
    { name: "newUser", description: "Yeni Kullanıcı" },
  ];

  // Tüm yetkiler
  const allPermissions = await prisma.permission.findMany();

  // Roller için atanacak yetkiler (key bazında)
  const rolePermissionsMap: Record<string, string[]> = {
    admin: [
      "create_leave_request",
      "creating_purchase_request",
      "view_users",
      "viewing_pending_approval",
      "role_authority_editing",
      "view_leave_request",
      "approving_leave_request",
      "adding_supplier",
      "view_purchase_requests",
      "view_all_leave_requests",
      "updating_purchasing_categories",
      "request_phase",
      "second_approval",
      "maintenance_reporting",
    ],
    assistant: [
      "create_leave_request",
      "creating_purchase_request",
      "view_users",
      "viewing_pending_approval",
      "role_authority_editing",
      "view_leave_request",
      "approving_leave_request",
      "view_purchase_requests",
      "view_all_leave_requests",
      "updating_purchasing_categories",
      "request_phase",
      "second_approval",
      "maintenance_reporting",
    ],
    secretary: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "view_purchase_requests",
      "request_phase",
    ],
    adminTech: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "view_purchase_requests",
      "adding_supplier",
      "first_approval",
      "invoice_upload",
      "invoice_check",
      "request_phase",
      "invoice_register",
      "maintenance_categories",
      "add_new_device",
      "viewing_devices",
      "annual_maintenance_planning",
      "periodic_control",
      "fault_management",
      "maintenance_reporting",
    ],
    finance: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "view_purchase_requests",
      "third_approval",
      "request_phase",
      "invoice_register",
    ],
    operations: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "request_phase",
      "view_purchase_requests",
    ],
    hr: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "request_phase",
      "view_purchase_requests",
      "maintenance_categories",
      "add_new_device",
      "viewing_devices",
      "annual_maintenance_planning",
      "periodic_control",
      "fault_management",
      "maintenance_reporting",
    ],
    coordinator: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "request_phase",
      "view_purchase_requests",
    ],
    specialist: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "request_phase",
      "view_purchase_requests",
    ],
    assistantSpecialist: [
      "create_leave_request",
      "creating_purchase_request",
      "view_leave_request",
      "request_phase",
      "view_purchase_requests",
    ],
    intern: [],
    newUser: [],
  };

  // Roller oluştur ve RolePermission tablosuna atama yap
  for (const roleData of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });

    const permissionKeys = rolePermissionsMap[role.name] || [];
    const permissionsForRole = allPermissions.filter((p) =>
      permissionKeys.includes(p.key)
    );

    // Önce var ise eski RolePermissionları sil
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Yeni RolePermissionları ekle
    await Promise.all(
      permissionsForRole.map((perm) =>
        prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id,
          },
        })
      )
    );
  }

  console.log("✅ Roller ve yetkiler başarıyla eklendi.");

  // Admin rolünü al
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) throw new Error("admin rolü bulunamadı.");

  // Genel Müdür kullanıcısını ekle
  const hashedPassword = await hash("Admin12345", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@teknokent.com" },
    update: {
      roleId: adminRole.id,
    },
    create: {
      firstName: "Yakup",
      lastName: "KÖSEOĞLU",
      username: "admin",
      email: "admin@teknokent.com",
      password: hashedPassword,
      approved: true,
      roleId: adminRole.id,
    },
  });

  // Önce var ise eski UserPermissionları sil
  await prisma.userPermission.deleteMany({
    where: { userId: adminUser.id },
  });

  // Admin kullanıcısına rolün yetkilerini UserPermission olarak ata
  const adminRolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: adminRole.id },
  });

  await Promise.all(
    adminRolePermissions.map((rp) =>
      prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: rp.permissionId,
        },
      })
    )
  );

  console.log("✅ Genel Müdür başarıyla oluşturuldu.");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
