module Access
  class FlowPermissions < Service
    def initialize(flow, user)
      @flow = flow
      @user = user
    end

    def call
      return nok!("Invalid flow") if @flow.nil?

      owned_by_user = @flow.user_id == @user&.id
      public_flow = @flow.public?

      ok!(
        {
          can_execute: public_flow || owned_by_user,
          can_edit: owned_by_user,
        }
      )
    end
  end
end