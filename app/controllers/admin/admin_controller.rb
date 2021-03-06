class Admin::AdminController < ActionController::Base
  protect_from_forgery

  #activate this for production
  USERS = { "melanie" => "downwithcheckcashing" }
  before_filter :authenticate if ENV['RAILS_ENV'] == 'production'

  layout "admin"

  MODELS = [Bank, BankCompany]

  def index
    @title = 'Bank'
  end

private

  def authenticate
    authenticate_or_request_with_http_digest do |username|
      USERS[username]
    end
  end

end

