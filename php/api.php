<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . "data";
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

$projectsFile = $dataDir . DIRECTORY_SEPARATOR . "projects.json";
$inquiriesFile = $dataDir . DIRECTORY_SEPARATOR . "inquiries.json";
$adminFile = $dataDir . DIRECTORY_SEPARATOR . "admin.json";

function hashAdminPassword(string $plain): string {
    return hash("sha256", "hs-portfolio-vault-2026:" . $plain);
}

$defaultProjects = [
    [
        "id" => "proj-1",
        "title" => "Luxora Watches",
        "category" => "E-COMMERCE",
        "description" => "Ultra-Luxury Horology Experience",
        "image" => "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80",
        "link" => "./luxora-watches/index.html",
    ],
    [
        "id" => "proj-2",
        "title" => "Interior Studio",
        "category" => "CORPORATE",
        "description" => "Quiet-Luxury Architectural Archive",
        "image" => "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80",
        "link" => "./interior-desgin/index-interior.html",
    ],
    [
        "id" => "proj-3",
        "title" => "FitZone Gym",
        "category" => "FITNESS",
        "description" => "High-Converting Athletic Funnel",
        "image" => "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80",
        "link" => "./fintzone-gym/index-fitzone.html",
    ],
    [
        "id" => "proj-4",
        "title" => "Café Aurora",
        "category" => "HOSPITALITY",
        "description" => "Artisan Culinary Digital Menu",
        "image" => "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80",
        "link" => "./aurora-cafe/index-cafe.html",
    ],
];

function readJsonFile(string $path, array $fallback): array {
    if (!file_exists($path)) {
        file_put_contents($path, json_encode($fallback, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        return $fallback;
    }
    $decoded = json_decode((string) file_get_contents($path), true);
    return is_array($decoded) ? $decoded : $fallback;
}

function writeJsonFile(string $path, array $data): void {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

$resource = $_GET["resource"] ?? "projects";
$method = $_SERVER["REQUEST_METHOD"];
$rawInput = file_get_contents("php://input");
$body = json_decode($rawInput ?: "{}", true) ?? [];

if ($resource === "auth" && $method === "POST") {
    $action = (string) ($_GET["action"] ?? ($body["action"] ?? "login"));
    $adminData = readJsonFile($adminFile, ["passwordHash" => hashAdminPassword("hamood123")]);

    if ($action === "login") {
        $password = (string) ($body["password"] ?? "");
        if (hashAdminPassword($password) === ($adminData["passwordHash"] ?? "")) {
            echo json_encode(["ok" => true, "engine" => "PHP"]);
            exit;
        }
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "Incorrect password."]);
        exit;
    }

    if ($action === "change_password") {
        $currentPassword = (string) ($body["currentPassword"] ?? "");
        $newPassword = (string) ($body["newPassword"] ?? "");

        if (strlen($newPassword) < 4) {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "New password must be at least 4 characters."]);
            exit;
        }
        if (hashAdminPassword($currentPassword) !== ($adminData["passwordHash"] ?? "")) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "Current password is incorrect."]);
            exit;
        }

        writeJsonFile($adminFile, ["passwordHash" => hashAdminPassword($newPassword)]);
        echo json_encode(["ok" => true, "engine" => "PHP", "message" => "Password updated successfully."]);
        exit;
    }
}

if ($resource === "contact" && $method === "POST") {
    $name = trim((string) ($body["name"] ?? ""));
    $email = trim((string) ($body["email"] ?? ""));
    $service = trim((string) ($body["service"] ?? "Web Design"));
    $details = trim((string) ($body["details"] ?? ""));

    if ($name === "" || !filter_var($email, FILTER_VALIDATE_EMAIL) || $details === "") {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Please provide a valid name, email, and project details."]);
        exit;
    }

    $inquiries = readJsonFile($inquiriesFile, []);
    $entry = [
        "id" => "inq-" . time(),
        "name" => htmlspecialchars($name, ENT_QUOTES, "UTF-8"),
        "email" => $email,
        "service" => htmlspecialchars($service, ENT_QUOTES, "UTF-8"),
        "details" => htmlspecialchars($details, ENT_QUOTES, "UTF-8"),
        "createdAt" => gmdate("c"),
    ];
    array_unshift($inquiries, $entry);
    writeJsonFile($inquiriesFile, $inquiries);

    http_response_code(201);
    echo json_encode([
        "ok" => true,
        "engine" => "PHP " . PHP_VERSION,
        "message" => "Inquiry saved by PHP backend successfully.",
        "inquiry" => $entry,
    ]);
    exit;
}

if ($resource === "projects") {
    $projects = readJsonFile($projectsFile, $defaultProjects);

    if ($method === "GET") {
        echo json_encode(["ok" => true, "engine" => "PHP", "projects" => $projects]);
        exit;
    }

    if ($method === "POST") {
        $newProject = [
            "id" => "proj-" . round(microtime(true) * 1000),
            "title" => trim((string) ($body["title"] ?? "")),
            "category" => strtoupper(trim((string) ($body["category"] ?? "WEB DESIGN"))),
            "description" => trim((string) ($body["description"] ?? "")),
            "image" => trim((string) ($body["image"] ?? "")),
            "link" => trim((string) ($body["link"] ?? "#")),
        ];
        if ($newProject["title"] === "" || $newProject["description"] === "" || $newProject["image"] === "") {
            http_response_code(400);
            echo json_encode(["ok" => false, "error" => "Missing required project fields."]);
            exit;
        }
        array_unshift($projects, $newProject);
        writeJsonFile($projectsFile, $projects);
        http_response_code(201);
        echo json_encode(["ok" => true, "engine" => "PHP", "project" => $newProject, "projects" => $projects]);
        exit;
    }

    if ($method === "PUT") {
        $id = (string) ($_GET["id"] ?? ($body["id"] ?? ""));
        foreach ($projects as &$proj) {
            if ($proj["id"] === $id) {
                $proj["title"] = trim((string) ($body["title"] ?? $proj["title"]));
                $proj["category"] = strtoupper(trim((string) ($body["category"] ?? $proj["category"])));
                $proj["description"] = trim((string) ($body["description"] ?? $proj["description"]));
                $proj["image"] = trim((string) ($body["image"] ?? $proj["image"]));
                $proj["link"] = trim((string) ($body["link"] ?? $proj["link"]));
            }
        }
        unset($proj);
        writeJsonFile($projectsFile, $projects);
        echo json_encode(["ok" => true, "engine" => "PHP", "projects" => $projects]);
        exit;
    }

    if ($method === "DELETE") {
        $id = (string) ($_GET["id"] ?? "");
        $projects = array_values(array_filter($projects, function ($p) use ($id) {
            return ($p["id"] ?? "") !== $id;
        }));
        writeJsonFile($projectsFile, $projects);
        echo json_encode(["ok" => true, "engine" => "PHP", "projects" => $projects]);
        exit;
    }
}

http_response_code(404);
echo json_encode(["ok" => false, "error" => "Invalid endpoint"]);