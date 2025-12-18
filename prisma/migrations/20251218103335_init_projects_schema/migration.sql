-- CreateTable
CREATE TABLE "proj_projects" (
    "id" UUID NOT NULL,
    "project_number" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "project_type" VARCHAR(50) NOT NULL,
    "objectives" TEXT,
    "scope" TEXT,
    "deliverables" TEXT,
    "estimated_budget" DECIMAL(14,2) NOT NULL,
    "approved_budget" DECIMAL(14,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'SAR',
    "planned_start_date" DATE NOT NULL,
    "planned_end_date" DATE NOT NULL,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "duration_days" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "project_manager_id" UUID,
    "sponsor_id" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_team_members" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "responsibilities" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_project_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_phases" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "phase_number" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "allocated_budget" DECIMAL(14,2),
    "spent_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "planned_start_date" DATE NOT NULL,
    "planned_end_date" DATE NOT NULL,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "depends_on_phase_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_work_packages" (
    "id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "package_number" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "scope_of_work" TEXT,
    "deliverables" TEXT,
    "acceptance_criteria" TEXT,
    "estimated_cost" DECIMAL(14,2),
    "contracted_amount" DECIMAL(14,2),
    "actual_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "planned_start_date" DATE,
    "planned_end_date" DATE,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "duration_days" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "contractor_id" UUID,
    "contract_id" UUID,
    "supervisor_id" UUID,
    "inspector_id" UUID,
    "inspection_date" DATE,
    "inspection_result" VARCHAR(20),
    "inspection_notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "payment_order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_work_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_work_package_materials" (
    "id" UUID NOT NULL,
    "work_package_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "item_code" VARCHAR(50),
    "item_name" VARCHAR(200),
    "required_quantity" DECIMAL(15,3) NOT NULL,
    "issued_quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "used_quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "returned_quantity" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(15,2),
    "total_cost" DECIMAL(15,2),
    "stock_issue_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_work_package_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_contractors" (
    "id" UUID NOT NULL,
    "contractor_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200),
    "contact_person" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" TEXT,
    "contractor_type" VARCHAR(50),
    "specializations" JSONB NOT NULL DEFAULT '[]',
    "license_number" VARCHAR(50),
    "license_expiry" DATE,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_projects" INTEGER NOT NULL DEFAULT 0,
    "completed_projects" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "bank_name" VARCHAR(100),
    "bank_account" VARCHAR(50),
    "iban" VARCHAR(34),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_contracts" (
    "id" UUID NOT NULL,
    "contract_number" VARCHAR(30) NOT NULL,
    "contractor_id" UUID NOT NULL,
    "project_id" UUID,
    "contract_type" VARCHAR(50) NOT NULL,
    "contract_value" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'SAR',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "terms_and_conditions" TEXT,
    "payment_terms" TEXT,
    "warranty_period" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_contract_rates" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "service_code" VARCHAR(50) NOT NULL,
    "service_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(20) NOT NULL,
    "unit_rate" DECIMAL(15,2) NOT NULL,
    "min_quantity" DECIMAL(15,3),
    "max_quantity" DECIMAL(15,3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_contract_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_contractor_invoices" (
    "id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "project_id" UUID,
    "invoice_number" VARCHAR(30) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "gross_amount" DECIMAL(14,2) NOT NULL,
    "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "retention_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payment_order_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_contractor_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_budgets" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "budget_version" INTEGER NOT NULL DEFAULT 1,
    "original_budget" DECIMAL(14,2) NOT NULL,
    "adjustments" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "current_budget" DECIMAL(14,2) NOT NULL,
    "committed_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "spent_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "remaining_budget" DECIMAL(14,2),
    "commitment_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "spent_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_project_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_budget_allocations" (
    "id" UUID NOT NULL,
    "budget_id" UUID NOT NULL,
    "allocation_type" VARCHAR(50) NOT NULL,
    "reference_id" UUID,
    "reference_name" VARCHAR(200),
    "allocated_amount" DECIMAL(14,2) NOT NULL,
    "spent_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_expenses" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "phase_id" UUID,
    "work_package_id" UUID,
    "expense_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "expense_date" DATE NOT NULL,
    "journal_entry_id" UUID,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_project_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_task_dependencies" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "task_type" VARCHAR(50) NOT NULL,
    "depends_on_id" UUID NOT NULL,
    "depends_on_type" VARCHAR(50) NOT NULL,
    "dependency_type" VARCHAR(20) NOT NULL DEFAULT 'finish_to_start',
    "lag_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_milestones" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "planned_date" DATE NOT NULL,
    "actual_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "linked_task_id" UUID,
    "linked_task_type" VARCHAR(50),
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proj_project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_project_baselines" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "baseline_number" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(100),
    "description" TEXT,
    "baseline_data" JSONB NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_project_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proj_critical_path_cache" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "critical_tasks" JSONB NOT NULL,
    "total_duration" INTEGER,
    "earliest_finish" DATE,
    "latest_finish" DATE,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proj_critical_path_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proj_projects_project_number_key" ON "proj_projects"("project_number");

-- CreateIndex
CREATE UNIQUE INDEX "proj_project_team_members_project_id_user_id_key" ON "proj_project_team_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "proj_project_phases_project_id_phase_number_key" ON "proj_project_phases"("project_id", "phase_number");

-- CreateIndex
CREATE UNIQUE INDEX "proj_contractors_contractor_code_key" ON "proj_contractors"("contractor_code");

-- CreateIndex
CREATE UNIQUE INDEX "proj_contracts_contract_number_key" ON "proj_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "proj_contractor_invoices_invoice_number_key" ON "proj_contractor_invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "proj_project_budgets_project_id_budget_version_key" ON "proj_project_budgets"("project_id", "budget_version");

-- CreateIndex
CREATE UNIQUE INDEX "proj_project_baselines_project_id_baseline_number_key" ON "proj_project_baselines"("project_id", "baseline_number");

-- CreateIndex
CREATE UNIQUE INDEX "proj_critical_path_cache_project_id_key" ON "proj_critical_path_cache"("project_id");

-- AddForeignKey
ALTER TABLE "proj_project_team_members" ADD CONSTRAINT "proj_project_team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_phases" ADD CONSTRAINT "proj_project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_phases" ADD CONSTRAINT "proj_project_phases_depends_on_phase_id_fkey" FOREIGN KEY ("depends_on_phase_id") REFERENCES "proj_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_work_packages" ADD CONSTRAINT "proj_work_packages_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "proj_project_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_work_packages" ADD CONSTRAINT "proj_work_packages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_work_package_materials" ADD CONSTRAINT "proj_work_package_materials_work_package_id_fkey" FOREIGN KEY ("work_package_id") REFERENCES "proj_work_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_contracts" ADD CONSTRAINT "proj_contracts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "proj_contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_contract_rates" ADD CONSTRAINT "proj_contract_rates_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "proj_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_contractor_invoices" ADD CONSTRAINT "proj_contractor_invoices_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "proj_contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_contractor_invoices" ADD CONSTRAINT "proj_contractor_invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "proj_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_budgets" ADD CONSTRAINT "proj_project_budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_budget_allocations" ADD CONSTRAINT "proj_budget_allocations_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "proj_project_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_expenses" ADD CONSTRAINT "proj_project_expenses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_expenses" ADD CONSTRAINT "proj_project_expenses_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "proj_project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_expenses" ADD CONSTRAINT "proj_project_expenses_work_package_id_fkey" FOREIGN KEY ("work_package_id") REFERENCES "proj_work_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_milestones" ADD CONSTRAINT "proj_project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proj_project_baselines" ADD CONSTRAINT "proj_project_baselines_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "proj_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
