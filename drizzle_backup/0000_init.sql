-- Enums
CREATE TYPE "public"."user_role" AS ENUM ('ADMIN');
CREATE TYPE "public"."project_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "public"."article_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "public"."learning_status" AS ENUM ('PLANNED', 'LEARNING', 'PAUSED', 'COMPLETED');
CREATE TYPE "public"."employment_type" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');
CREATE TYPE "public"."contact_status" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
CREATE TYPE "public"."architecture_node_type" AS ENUM ('SERVICE', 'DATABASE', 'QUEUE', 'CACHE', 'CLIENT', 'EXTERNAL', 'GATEWAY', 'STORAGE');
--> statement-breakpoint

-- users
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'ADMIN' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
--> statement-breakpoint

-- sessions
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");
--> statement-breakpoint

-- profile
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"headline" text NOT NULL,
	"short_bio" text NOT NULL,
	"long_bio" text,
	"location" text,
	"availability_status" text,
	"profile_image_url" text,
	"resume_url" text,
	"github_url" text,
	"linkedin_url" text,
	"email" text NOT NULL,
	"website_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- technologies
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"category" text,
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_slug_idx" ON "technologies" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "technologies_category_idx" ON "technologies" USING btree ("category");
--> statement-breakpoint

-- projects
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text,
	"problem" text,
	"solution" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "project_status" DEFAULT 'DRAFT' NOT NULL,
	"start_date" date,
	"end_date" date,
	"github_url" text,
	"live_url" text,
	"architecture_description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");
--> statement-breakpoint

-- project_technologies
CREATE TABLE "project_technologies" (
	"project_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "project_technologies_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

-- architecture_layers
CREATE TABLE "architecture_layers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "architecture_layers" ADD CONSTRAINT "architecture_layers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "architecture_layers_project_id_idx" ON "architecture_layers" USING btree ("project_id");
--> statement-breakpoint

-- architecture_nodes
CREATE TABLE "architecture_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"layer_id" uuid,
	"label" text NOT NULL,
	"type" "architecture_node_type" NOT NULL,
	"description" text,
	"position" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "architecture_nodes" ADD CONSTRAINT "architecture_nodes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "architecture_nodes" ADD CONSTRAINT "architecture_nodes_layer_id_architecture_layers_id_fk" FOREIGN KEY ("layer_id") REFERENCES "public"."architecture_layers"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "architecture_nodes_project_id_idx" ON "architecture_nodes" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX "architecture_nodes_layer_id_idx" ON "architecture_nodes" USING btree ("layer_id");
--> statement-breakpoint

-- architecture_connections
CREATE TABLE "architecture_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"from_node_id" uuid NOT NULL,
	"to_node_id" uuid NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "architecture_connections" ADD CONSTRAINT "architecture_connections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "architecture_connections" ADD CONSTRAINT "architecture_connections_from_node_id_architecture_nodes_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "public"."architecture_nodes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "architecture_connections" ADD CONSTRAINT "architecture_connections_to_node_id_architecture_nodes_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "public"."architecture_nodes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "architecture_connections_project_id_idx" ON "architecture_connections" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX "architecture_connections_from_node_id_idx" ON "architecture_connections" USING btree ("from_node_id");
--> statement-breakpoint
CREATE INDEX "architecture_connections_to_node_id_idx" ON "architecture_connections" USING btree ("to_node_id");
--> statement-breakpoint

-- experiences
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"employment_type" "employment_type" DEFAULT 'FULL_TIME' NOT NULL,
	"location" text,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"current" boolean DEFAULT false NOT NULL,
	"company_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "experiences_start_date_idx" ON "experiences" USING btree ("start_date");
--> statement-breakpoint

-- experience_highlights
CREATE TABLE "experience_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experience_id" uuid NOT NULL,
	"content" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_highlights" ADD CONSTRAINT "experience_highlights_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "experience_highlights_experience_id_idx" ON "experience_highlights" USING btree ("experience_id");
--> statement-breakpoint

-- experience_technologies
CREATE TABLE "experience_technologies" (
	"experience_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "experience_technologies_experience_id_technology_id_pk" PRIMARY KEY("experience_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

-- education
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"field_of_study" text,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"current" boolean DEFAULT false NOT NULL,
	"location" text,
	"url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "education_start_date_idx" ON "education" USING btree ("start_date");
--> statement-breakpoint

-- skills
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"proficiency" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "skills_category_idx" ON "skills" USING btree ("category");
--> statement-breakpoint

-- skill_technologies
CREATE TABLE "skill_technologies" (
	"skill_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "skill_technologies_skill_id_technology_id_pk" PRIMARY KEY("skill_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "skill_technologies" ADD CONSTRAINT "skill_technologies_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "skill_technologies" ADD CONSTRAINT "skill_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- learning_topics
CREATE TABLE "learning_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" "learning_status" DEFAULT 'PLANNED' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"started_at" date,
	"target_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "learning_topics_status_idx" ON "learning_topics" USING btree ("status");
--> statement-breakpoint

-- learning_topic_technologies
CREATE TABLE "learning_topic_technologies" (
	"learning_topic_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	CONSTRAINT "learning_topic_technologies_learning_topic_id_technology_id_pk" PRIMARY KEY("learning_topic_id","technology_id")
);
--> statement-breakpoint
ALTER TABLE "learning_topic_technologies" ADD CONSTRAINT "learning_topic_technologies_learning_topic_id_learning_topics_id_fk" FOREIGN KEY ("learning_topic_id") REFERENCES "public"."learning_topics"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "learning_topic_technologies" ADD CONSTRAINT "learning_topic_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- articles
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"status" "article_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"reading_time_minutes" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "articles_status_idx" ON "articles" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
--> statement-breakpoint

-- tags
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
--> statement-breakpoint

-- article_tags
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- achievements
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"organization" text,
	"date" date,
	"url" text,
	"image_url" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "achievements_date_idx" ON "achievements" USING btree ("date");
--> statement-breakpoint

-- certifications
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"credential_id" text,
	"credential_url" text,
	"issued_at" date,
	"expires_at" date,
	"image_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "certifications_issued_at_idx" ON "certifications" USING btree ("issued_at");
--> statement-breakpoint

-- timeline
CREATE TABLE "timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year_or_label" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" date,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "timeline_date_idx" ON "timeline" USING btree ("date");
--> statement-breakpoint

-- social_links
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- contact_messages
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'UNREAD' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status");
