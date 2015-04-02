module HealthChecks
 module HealthCheck

    def self.included(base)
      base.extend ClassMethods
      base.class_attribute :_weight
      base.class_attribute :_authorization
      base.class_attribute :_name
      base.class_attribute :_message
    end

    #Supports carrying over DSL attributes to the instantiated
    #parent class
    def initialize
      #@weight = self.class.instance_variable_get('@weight')
      @authorization = self.class.instance_variable_get('@authorization')
      @name = self.class.instance_variable_get('@name')
      @message = self.class.instance_variable_get('@message')
      super
    end

    :private
      def authorized(deps)
        auth_levels = {
          all: 0,
          collaborator: 1,
          admin: 2
        }
        current = auth_levels[deps[:authorization]]
        required = auth_levels[_authorization]
        deps[:logged_in] && current >= required
      end

    module ClassMethods
      extend self

      def weight(weight)
        self._weight = weight
      end

      def authorization(authorization)
        self._authorization = authorization
      end

      def name(name)
        self._name = name
      end

      def message(message)
        self._message = message
      end

    end
  end
end
