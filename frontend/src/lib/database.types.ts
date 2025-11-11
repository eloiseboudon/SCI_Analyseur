export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectType = 'location_nue' | 'lmnp' | 'lmp' | 'sci_ir' | 'sci_is';
export type FiscalRegime = 'micro_foncier' | 'reel' | 'micro_bic' | 'reel_simplifie' | 'reel_normal';
export type ChargeType = 'taxe_fonciere' | 'assurance_pno' | 'assurance_gli' | 'copropriete' | 'gestion' | 'comptabilite' | 'entretien' | 'travaux' | 'crl' | 'cfe' | 'other';
export type IncentiveType = 'pinel' | 'denormandie' | 'malraux' | 'loc_avantages' | 'deficit_foncier' | 'censi_bouvard' | 'lmnp_ancien' | 'monuments_historiques' | 'girardin' | 'other';

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          project_type: ProjectType;
          fiscal_regime: FiscalRegime;
          simulation_duration: number;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          project_type?: ProjectType;
          fiscal_regime?: FiscalRegime;
          simulation_duration?: number;
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          project_type?: ProjectType;
          fiscal_regime?: FiscalRegime;
          simulation_duration?: number;
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_settings: {
        Row: {
          id: string;
          project_id: string;
          structure_type: string;
          structure_name: string | null;
          fiscal_regime: string;
          regime_start_year: number | null;
          personal_tax_rate: number;
          social_charges_rate: number;
          is_rate_tier1: number | null;
          is_threshold_tier1: number | null;
          is_rate_tier2: number | null;
          pfu_rate: number | null;
          use_pfu: boolean | null;
          micro_foncier_threshold: number | null;
          micro_bic_threshold: number | null;
          micro_foncier_abatement: number | null;
          micro_bic_abatement: number | null;
          deficit_foncier_limit: number | null;
          deficit_carryforward_years: number | null;
          vacancy_rate: number;
          rent_growth_rate: number;
          charges_inflation_rate: number;
          property_appreciation_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          structure_type?: string;
          structure_name?: string | null;
          fiscal_regime?: string;
          regime_start_year?: number | null;
          personal_tax_rate?: number;
          social_charges_rate?: number;
          is_rate_tier1?: number | null;
          is_threshold_tier1?: number | null;
          is_rate_tier2?: number | null;
          pfu_rate?: number | null;
          use_pfu?: boolean | null;
          micro_foncier_threshold?: number | null;
          micro_bic_threshold?: number | null;
          micro_foncier_abatement?: number | null;
          micro_bic_abatement?: number | null;
          deficit_foncier_limit?: number | null;
          deficit_carryforward_years?: number | null;
          vacancy_rate?: number;
          rent_growth_rate?: number;
          charges_inflation_rate?: number;
          property_appreciation_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          structure_type?: string;
          structure_name?: string | null;
          fiscal_regime?: string;
          regime_start_year?: number | null;
          personal_tax_rate?: number;
          social_charges_rate?: number;
          is_rate_tier1?: number | null;
          is_threshold_tier1?: number | null;
          is_rate_tier2?: number | null;
          pfu_rate?: number | null;
          use_pfu?: boolean | null;
          micro_foncier_threshold?: number | null;
          micro_bic_threshold?: number | null;
          micro_foncier_abatement?: number | null;
          micro_bic_abatement?: number | null;
          deficit_foncier_limit?: number | null;
          deficit_carryforward_years?: number | null;
          vacancy_rate?: number;
          rent_growth_rate?: number;
          charges_inflation_rate?: number;
          property_appreciation_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          address: string | null;
          purchase_price: number;
          agency_fees: number;
          notary_fees: number;
          renovation_budget: number;
          furniture_budget: number;
          land_value: number;
          building_value: number;
          building_depreciation_duration: number;
          works_depreciation_duration: number;
          furniture_depreciation_duration: number;
          notary_fees_depreciation_duration: number | null;
          purchase_date: string;
          first_rental_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          address?: string | null;
          purchase_price: number;
          agency_fees?: number;
          notary_fees?: number;
          renovation_budget?: number;
          furniture_budget?: number;
          land_value?: number;
          building_value?: number;
          building_depreciation_duration?: number;
          works_depreciation_duration?: number;
          furniture_depreciation_duration?: number;
          notary_fees_depreciation_duration?: number | null;
          purchase_date?: string;
          first_rental_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          address?: string | null;
          purchase_price?: number;
          agency_fees?: number;
          notary_fees?: number;
          renovation_budget?: number;
          furniture_budget?: number;
          land_value?: number;
          building_value?: number;
          building_depreciation_duration?: number;
          works_depreciation_duration?: number;
          furniture_depreciation_duration?: number;
          notary_fees_depreciation_duration?: number | null;
          purchase_date?: string;
          first_rental_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          property_id: string;
          loan_amount: number;
          interest_rate: number;
          duration_years: number;
          deferral_type: string;
          deferral_months: number;
          insurance_rate: number;
          application_fee: number;
          guarantee_fee: number;
          cash_contribution: number;
          current_account_contribution: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          loan_amount: number;
          interest_rate: number;
          duration_years: number;
          deferral_type?: string;
          deferral_months?: number;
          insurance_rate?: number;
          application_fee?: number;
          guarantee_fee?: number;
          cash_contribution?: number;
          current_account_contribution?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          loan_amount?: number;
          interest_rate?: number;
          duration_years?: number;
          deferral_type?: string;
          deferral_months?: number;
          insurance_rate?: number;
          application_fee?: number;
          guarantee_fee?: number;
          cash_contribution?: number;
          current_account_contribution?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lots: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          lot_type: string;
          surface_area: number | null;
          monthly_rent: number;
          recoverable_charges: number;
          rental_start_date: string;
          expected_vacancy_months: number;
          is_furnished: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          lot_type?: string;
          surface_area?: number | null;
          monthly_rent: number;
          recoverable_charges?: number;
          rental_start_date: string;
          expected_vacancy_months?: number;
          is_furnished?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          lot_type?: string;
          surface_area?: number | null;
          monthly_rent?: number;
          recoverable_charges?: number;
          rental_start_date?: string;
          expected_vacancy_months?: number;
          is_furnished?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_charges: {
        Row: {
          id: string;
          property_id: string;
          charge_type: ChargeType;
          charge_name: string;
          amount: number;
          is_percentage: boolean;
          is_deductible: boolean;
          frequency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          charge_type: ChargeType;
          charge_name: string;
          amount: number;
          is_percentage?: boolean;
          is_deductible?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          charge_type?: ChargeType;
          charge_name?: string;
          amount?: number;
          is_percentage?: boolean;
          is_deductible?: boolean;
          frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      fiscal_incentives: {
        Row: {
          id: string;
          project_id: string;
          incentive_type: IncentiveType;
          commitment_duration: number;
          reduction_rate: number;
          max_amount: number | null;
          rent_ceiling: number | null;
          tenant_income_ceiling: number | null;
          rent_discount_rate: number | null;
          works_minimum_percentage: number | null;
          protected_sector_rate: number | null;
          works_max_over_4_years: number | null;
          loc_avantages_level: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          incentive_type: IncentiveType;
          commitment_duration?: number;
          reduction_rate: number;
          max_amount?: number | null;
          rent_ceiling?: number | null;
          tenant_income_ceiling?: number | null;
          rent_discount_rate?: number | null;
          works_minimum_percentage?: number | null;
          protected_sector_rate?: number | null;
          works_max_over_4_years?: number | null;
          loc_avantages_level?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          incentive_type?: IncentiveType;
          commitment_duration?: number;
          reduction_rate?: number;
          max_amount?: number | null;
          rent_ceiling?: number | null;
          tenant_income_ceiling?: number | null;
          rent_discount_rate?: number | null;
          works_minimum_percentage?: number | null;
          protected_sector_rate?: number | null;
          works_max_over_4_years?: number | null;
          loc_avantages_level?: string | null;
          created_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          is_baseline: boolean;
          modified_parameters: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          is_baseline?: boolean;
          modified_parameters?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          is_baseline?: boolean;
          modified_parameters?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calculation_results: {
        Row: {
          id: string;
          project_id: string;
          scenario_id: string | null;
          year: number;
          gross_revenue: number;
          effective_revenue: number;
          total_charges: number;
          financial_charges: number;
          depreciation: number;
          result_before_tax: number;
          tax_amount: number;
          net_result: number;
          capital_repayment: number;
          cash_flow: number;
          cumulative_cash_flow: number;
          loan_balance: number;
          net_assets: number;
          gross_yield: number;
          net_yield: number;
          roi: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          scenario_id?: string | null;
          year: number;
          gross_revenue?: number;
          effective_revenue?: number;
          total_charges?: number;
          financial_charges?: number;
          depreciation?: number;
          result_before_tax?: number;
          tax_amount?: number;
          net_result?: number;
          capital_repayment?: number;
          cash_flow?: number;
          cumulative_cash_flow?: number;
          loan_balance?: number;
          net_assets?: number;
          gross_yield?: number;
          net_yield?: number;
          roi?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          scenario_id?: string | null;
          year?: number;
          gross_revenue?: number;
          effective_revenue?: number;
          total_charges?: number;
          financial_charges?: number;
          depreciation?: number;
          result_before_tax?: number;
          tax_amount?: number;
          net_result?: number;
          capital_repayment?: number;
          cash_flow?: number;
          cumulative_cash_flow?: number;
          loan_balance?: number;
          net_assets?: number;
          gross_yield?: number;
          net_yield?: number;
          roi?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
